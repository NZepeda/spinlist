-- Align the live database with docs/database_schema.mermaid.
-- The current normalized schema stores provider IDs at the release_group level,
-- so this migration synthesizes stable fallback album identifiers when needed.

drop trigger if exists "record_review_revision_on_write" on "public"."reviews";
drop function if exists "public"."record_review_revision"();

-- Ensure every release group has a concrete album row before reviews and favorites move to albums.
insert into "public"."albums" ("id", "release_group_id", "title", "images", "tracklist")
select
  gen_random_uuid(),
  "rg"."id",
  "rg"."title",
  '[]'::jsonb,
  '[]'::jsonb
from "public"."release_groups" as "rg"
where not exists (
  select 1
  from "public"."albums" as "a"
  where "a"."release_group_id" = "rg"."id"
);

alter table "public"."artists"
add column "spotify_id" text;

with "artist_spotify" as (
  select
    "m"."artist_id",
    min("m"."provider_id") as "spotify_id"
  from "public"."mappings" as "m"
  where "m"."artist_id" is not null
    and "m"."provider_name" = 'spotify'
  group by "m"."artist_id"
)
update "public"."artists" as "a"
set "spotify_id" = coalesce("artist_spotify"."spotify_id", 'generated:' || "a"."id"::text)
from "artist_spotify"
where "artist_spotify"."artist_id" = "a"."id";

update "public"."artists"
set "spotify_id" = coalesce("spotify_id", 'generated:' || "id"::text)
where "spotify_id" is null;

alter table "public"."artists"
alter column "spotify_id" set not null;

alter table "public"."artists"
add constraint "artists_spotify_id_key" unique ("spotify_id");

alter table "public"."albums"
add column "spotify_id" text,
add column "slug" text,
add column "type" text,
add column "release_year" integer,
add column "upc" text;

with "release_group_spotify" as (
  select
    "m"."release_group_id",
    min("m"."provider_id") as "spotify_id",
    min("m"."upc") filter (where "m"."upc" is not null) as "upc"
  from "public"."mappings" as "m"
  where "m"."release_group_id" is not null
    and "m"."provider_name" = 'spotify'
  group by "m"."release_group_id"
),
"release_group_album_counts" as (
  select
    "a"."release_group_id",
    count(*) as "album_count"
  from "public"."albums" as "a"
  group by "a"."release_group_id"
)
update "public"."albums" as "a"
set
  "spotify_id" = coalesce(
    case
      when "release_group_album_counts"."album_count" = 1 then "release_group_spotify"."spotify_id"
      when "release_group_spotify"."spotify_id" is not null then "release_group_spotify"."spotify_id" || ':' || substr("a"."id"::text, 1, 8)
      else null
    end,
    'generated:' || "a"."id"::text
  ),
  "slug" = case
    when "release_group_album_counts"."album_count" = 1 then "rg"."slug"
    else "rg"."slug" || '-' || substr("a"."id"::text, 1, 8)
  end,
  "type" = "rg"."type",
  "release_year" = "rg"."original_release_year",
  "upc" = "release_group_spotify"."upc"
from "public"."release_groups" as "rg"
left join "release_group_spotify"
  on "release_group_spotify"."release_group_id" = "rg"."id"
join "release_group_album_counts"
  on "release_group_album_counts"."release_group_id" = "rg"."id"
where "a"."release_group_id" = "rg"."id";

alter table "public"."albums"
alter column "spotify_id" set not null,
alter column "slug" set not null,
alter column "type" set not null;

alter table "public"."albums"
add constraint "albums_spotify_id_key" unique ("spotify_id");

alter table "public"."albums"
add constraint "albums_slug_key" unique ("slug");

alter table "public"."albums"
add constraint "albums_type_check" check (("type" = any (array['album'::text, 'ep'::text, 'single'::text])));

create table "public"."album_artists" (
  "album_id" uuid not null,
  "artist_id" uuid not null,
  "position" integer not null
);

alter table "public"."album_artists" owner to "postgres";
alter table "public"."album_artists" enable row level security;

insert into "public"."album_artists" ("album_id", "artist_id", "position")
select
  "a"."id",
  "rga"."artist_id",
  "rga"."position"
from "public"."albums" as "a"
join "public"."release_group_artists" as "rga"
  on "rga"."release_group_id" = "a"."release_group_id";

alter table "public"."album_artists"
add constraint "album_artists_pkey" primary key ("album_id", "artist_id");

alter table "public"."album_artists"
add constraint "album_artists_album_id_fkey" foreign key ("album_id") references "public"."albums"("id") on delete cascade;

alter table "public"."album_artists"
add constraint "album_artists_artist_id_fkey" foreign key ("artist_id") references "public"."artists"("id") on delete cascade;

alter table "public"."album_artists"
add constraint "album_artists_album_id_position_key" unique ("album_id", "position");

create index "idx_album_artists_album_id" on "public"."album_artists" using "btree" ("album_id");
create index "idx_album_artists_artist_id" on "public"."album_artists" using "btree" ("artist_id");

alter table "public"."reviews"
add column "album_id" uuid;

with "representative_albums" as (
  select distinct on ("a"."release_group_id")
    "a"."release_group_id",
    "a"."id" as "album_id"
  from "public"."albums" as "a"
  order by "a"."release_group_id", "a"."id"
)
update "public"."reviews" as "r"
set "album_id" = "representative_albums"."album_id"
from "representative_albums"
where "r"."release_group_id" = "representative_albums"."release_group_id";

create table "public"."review_revisions" (
  "id" uuid not null default gen_random_uuid(),
  "review_id" uuid not null,
  "user_id" uuid not null,
  "album_id" uuid not null,
  "rating" numeric(2,1) not null,
  "favorite_track" text,
  "body" text,
  "created_at" timestamp with time zone not null default now(),
  constraint "review_revisions_rating_check" check ((("rating" >= 0.5) and ("rating" <= 5.0) and ((((("rating" * 10))::integer % 5) = 0))))
);

alter table "public"."review_revisions" owner to "postgres";
alter table "public"."review_revisions" enable row level security;

insert into "public"."review_revisions" (
  "review_id",
  "user_id",
  "album_id",
  "rating",
  "favorite_track",
  "body",
  "created_at"
)
select
  "r"."id",
  "r"."user_id",
  "r"."album_id",
  "r"."rating",
  "r"."favorite_track",
  "r"."body",
  "r"."created_at"
from "public"."reviews" as "r";

with "review_resolution" as (
  select
    "r"."id",
    first_value("r"."id") over (
      partition by "r"."user_id", "r"."album_id"
      order by "r"."updated_at" desc, "r"."created_at" desc, "r"."id" desc
    ) as "canonical_review_id",
    row_number() over (
      partition by "r"."user_id", "r"."album_id"
      order by "r"."updated_at" desc, "r"."created_at" desc, "r"."id" desc
    ) as "review_rank"
  from "public"."reviews" as "r"
)
update "public"."review_revisions" as "rr"
set "review_id" = "review_resolution"."canonical_review_id"
from "review_resolution"
where "rr"."review_id" = "review_resolution"."id";

with "review_resolution" as (
  select
    "r"."id",
    row_number() over (
      partition by "r"."user_id", "r"."album_id"
      order by "r"."updated_at" desc, "r"."created_at" desc, "r"."id" desc
    ) as "review_rank"
  from "public"."reviews" as "r"
)
delete from "public"."reviews" as "r"
using "review_resolution"
where "review_resolution"."id" = "r"."id"
  and "review_resolution"."review_rank" > 1;

alter table "public"."reviews"
drop constraint if exists "reviews_release_group_id_fkey";

drop index if exists "public"."idx_reviews_release_group_id";

alter table "public"."reviews"
alter column "album_id" set not null;

alter table "public"."reviews"
add constraint "reviews_album_id_fkey" foreign key ("album_id") references "public"."albums"("id") on delete cascade;

alter table "public"."reviews"
add constraint "reviews_user_id_album_id_key" unique ("user_id", "album_id");

create index "idx_reviews_album_id" on "public"."reviews" using "btree" ("album_id");

alter table "public"."review_revisions"
add constraint "review_revisions_pkey" primary key ("id");

alter table "public"."review_revisions"
add constraint "review_revisions_album_id_fkey" foreign key ("album_id") references "public"."albums"("id") on delete cascade;

alter table "public"."review_revisions"
add constraint "review_revisions_review_id_fkey" foreign key ("review_id") references "public"."reviews"("id") on delete cascade;

alter table "public"."review_revisions"
add constraint "review_revisions_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;

create index "idx_review_revisions_album_id" on "public"."review_revisions" using "btree" ("album_id");
create index "idx_review_revisions_created_at" on "public"."review_revisions" using "btree" ("created_at" desc);
create index "idx_review_revisions_review_id" on "public"."review_revisions" using "btree" ("review_id");
create index "idx_review_revisions_user_id" on "public"."review_revisions" using "btree" ("user_id");

alter table "public"."favorites"
add column "album_id" uuid;

with "representative_albums" as (
  select distinct on ("a"."release_group_id")
    "a"."release_group_id",
    "a"."id" as "album_id"
  from "public"."albums" as "a"
  order by "a"."release_group_id", "a"."id"
)
update "public"."favorites" as "f"
set "album_id" = "representative_albums"."album_id"
from "representative_albums"
where "f"."release_group_id" = "representative_albums"."release_group_id";

alter table "public"."favorites"
drop constraint if exists "favorites_release_group_id_fkey";

drop index if exists "public"."idx_favorites_release_group_id";

alter table "public"."favorites"
drop constraint if exists "favorites_user_id_release_group_id_key";

alter table "public"."favorites"
alter column "album_id" set not null;

alter table "public"."favorites"
add constraint "favorites_album_id_fkey" foreign key ("album_id") references "public"."albums"("id") on delete cascade;

alter table "public"."favorites"
add constraint "favorites_user_id_album_id_key" unique ("user_id", "album_id");

create index "idx_favorites_album_id" on "public"."favorites" using "btree" ("album_id");

alter table "public"."reviews"
drop column "release_group_id";

alter table "public"."favorites"
drop column "release_group_id";

alter table "public"."albums"
drop constraint if exists "albums_release_group_id_fkey";

drop index if exists "public"."idx_albums_release_group_id";

alter table "public"."albums"
drop column "release_group_id";

drop table "public"."mappings";
drop table "public"."release_group_artists";
drop table "public"."release_groups";

create or replace function "public"."record_review_revision"() returns "trigger"
    language "plpgsql" security definer
    set "search_path" to 'public'
    as $$
begin
  insert into public.review_revisions (
    review_id,
    user_id,
    album_id,
    rating,
    favorite_track,
    body,
    created_at
  )
  values (
    new.id,
    new.user_id,
    new.album_id,
    new.rating,
    new.favorite_track,
    new.body,
    case
      when tg_op = 'INSERT' then new.created_at
      else new.updated_at
    end
  );

  return new;
end;
$$;

alter function "public"."record_review_revision"() owner to "postgres";

create or replace trigger "record_review_revision_on_write"
    after insert or update on "public"."reviews"
    for each row
    execute function "public"."record_review_revision"();

grant all on function "public"."record_review_revision"() to "anon";
grant all on function "public"."record_review_revision"() to "authenticated";
grant all on function "public"."record_review_revision"() to "service_role";

grant all on table "public"."album_artists" to "anon";
grant all on table "public"."album_artists" to "authenticated";
grant all on table "public"."album_artists" to "service_role";

grant all on table "public"."review_revisions" to "anon";
grant all on table "public"."review_revisions" to "authenticated";
grant all on table "public"."review_revisions" to "service_role";

create policy "Album artists are viewable by everyone"
on "public"."album_artists"
for select
using (true);

create policy "Anyone can create album artists"
on "public"."album_artists"
for insert
with check (true);

create policy "Anyone can update album artists"
on "public"."album_artists"
for update
using (true)
with check (true);

create policy "Review revisions are viewable by everyone"
on "public"."review_revisions"
for select
using (true);
