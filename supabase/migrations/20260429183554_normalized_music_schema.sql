drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop trigger if exists "update_album_stats_on_review_change" on "public"."reviews";

drop policy "Active profiles are viewable by everyone" on "public"."profiles";

drop policy "Users can update their own profile" on "public"."profiles";

drop policy "Anyone can join waitlist" on "public"."waitlist";

drop policy "Anyone can update albums" on "public"."albums";

drop policy "Anyone can update artists" on "public"."artists";

drop policy "Users can update their own reviews" on "public"."reviews";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."waitlist" from "anon";

revoke insert on table "public"."waitlist" from "anon";

revoke references on table "public"."waitlist" from "anon";

revoke select on table "public"."waitlist" from "anon";

revoke trigger on table "public"."waitlist" from "anon";

revoke truncate on table "public"."waitlist" from "anon";

revoke update on table "public"."waitlist" from "anon";

revoke delete on table "public"."waitlist" from "authenticated";

revoke insert on table "public"."waitlist" from "authenticated";

revoke references on table "public"."waitlist" from "authenticated";

revoke select on table "public"."waitlist" from "authenticated";

revoke trigger on table "public"."waitlist" from "authenticated";

revoke truncate on table "public"."waitlist" from "authenticated";

revoke update on table "public"."waitlist" from "authenticated";

revoke delete on table "public"."waitlist" from "service_role";

revoke insert on table "public"."waitlist" from "service_role";

revoke references on table "public"."waitlist" from "service_role";

revoke select on table "public"."waitlist" from "service_role";

revoke trigger on table "public"."waitlist" from "service_role";

revoke truncate on table "public"."waitlist" from "service_role";

revoke update on table "public"."waitlist" from "service_role";

alter table "public"."albums" drop constraint "albums_avg_rating_check";

alter table "public"."albums" drop constraint "albums_review_count_check";

alter table "public"."albums" drop constraint "albums_spotify_id_key";

alter table "public"."artists" drop constraint "artists_spotify_id_key";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."profiles" drop constraint "profiles_status_check";

alter table "public"."profiles" drop constraint "profiles_username_key";

alter table "public"."reviews" drop constraint "reviews_album_id_fkey";

alter table "public"."reviews" drop constraint "reviews_user_id_album_id_key";

alter table "public"."waitlist" drop constraint "waitlist_email_key";

alter table "public"."reviews" drop constraint "reviews_rating_check";

alter table "public"."reviews" drop constraint "reviews_user_id_fkey";

drop function if exists "public"."update_album_stats"();

alter table "public"."profiles" drop constraint "profiles_pkey";

alter table "public"."waitlist" drop constraint "waitlist_pkey";

drop index if exists "public"."albums_spotify_id_key";

drop index if exists "public"."artists_spotify_id_key";

drop index if exists "public"."idx_albums_avg_rating";

drop index if exists "public"."idx_albums_review_count";

drop index if exists "public"."idx_albums_slug";

drop index if exists "public"."idx_albums_spotify_id";

drop index if exists "public"."idx_artists_slug";

drop index if exists "public"."idx_artists_spotify_id";

drop index if exists "public"."idx_reviews_album_id";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."profiles_username_key";

drop index if exists "public"."reviews_user_id_album_id_key";

drop index if exists "public"."waitlist_email_key";

drop index if exists "public"."waitlist_pkey";

  create table "public"."favorites" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "release_group_id" uuid not null,
    "position" integer not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."favorites" enable row level security;


  create table "public"."follows" (
    "follower_id" uuid not null,
    "followed_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."follows" enable row level security;


  create table "public"."mappings" (
    "id" uuid not null default gen_random_uuid(),
    "artist_id" uuid,
    "release_group_id" uuid,
    "provider_name" text not null,
    "provider_id" text not null,
    "upc" text
      );


alter table "public"."mappings" enable row level security;


  create table "public"."release_groups" (
    "id" uuid not null default gen_random_uuid(),
    "artist_id" uuid not null,
    "title" text not null,
    "type" text not null,
    "original_release_year" integer,
    "mb_group_id" text not null,
    "slug" text not null
      );


alter table "public"."release_groups" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "username" text not null,
    "created_at" timestamp with time zone not null default now(),
    "status" text not null default 'pending'::text
      );


alter table "public"."users" enable row level security;

insert into "public"."users" ("id", "username", "created_at", "status")
select
  "profiles"."id",
  "profiles"."username",
  "profiles"."created_at",
  coalesce("profiles"."status", 'pending'::text)
from "public"."profiles" as "profiles";

insert into "public"."artists" (
  "id",
  "spotify_id",
  "name",
  "image_url",
  "created_at",
  "last_synced_at",
  "slug"
)
select
  gen_random_uuid(),
  'generated:' || substr(md5("album_artists"."artist"), 1, 24),
  "album_artists"."artist",
  null,
  now(),
  now(),
  lower(
    trim(
      both '-' from regexp_replace(
        regexp_replace("album_artists"."artist", '[^a-zA-Z0-9]+', '-', 'g'),
        '-+',
        '-',
        'g'
      )
    )
  ) || '-' || substr(md5("album_artists"."artist"), 1, 8)
from (
  select distinct "artist"
  from "public"."albums"
) as "album_artists"
left join "public"."artists" as "artists"
  on lower("artists"."name") = lower("album_artists"."artist")
where "artists"."id" is null;

insert into "public"."release_groups" (
  "id",
  "artist_id",
  "title",
  "type",
  "original_release_year",
  "mb_group_id",
  "slug"
)
select
  gen_random_uuid(),
  "artists"."id",
  "albums"."title",
  'album',
  extract(year from "albums"."release_date")::integer,
  'generated:' || "albums"."id"::text,
  "albums"."slug"
from "public"."albums" as "albums"
join "public"."artists" as "artists"
  on lower("artists"."name") = lower("albums"."artist")
where not exists (
  select 1
  from "public"."release_groups" as "release_groups"
  where "release_groups"."slug" = "albums"."slug"
);

insert into "public"."mappings" ("artist_id", "provider_name", "provider_id")
select
  "artists"."id",
  'spotify',
  "artists"."spotify_id"
from "public"."artists" as "artists"
where "artists"."spotify_id" is not null
  and not exists (
    select 1
    from "public"."mappings" as "mappings"
    where "mappings"."provider_name" = 'spotify'
      and "mappings"."provider_id" = "artists"."spotify_id"
  );

insert into "public"."mappings" (
  "release_group_id",
  "provider_name",
  "provider_id"
)
select
  "release_groups"."id",
  'spotify',
  "albums"."spotify_id"
from "public"."albums" as "albums"
join "public"."release_groups" as "release_groups"
  on "release_groups"."slug" = "albums"."slug"
where "albums"."spotify_id" is not null
  and not exists (
    select 1
    from "public"."mappings" as "mappings"
    where "mappings"."provider_name" = 'spotify'
      and "mappings"."provider_id" = "albums"."spotify_id"
  );

alter table "public"."albums" add column "release_group_id" uuid;

alter table "public"."albums" add column "tracklist" jsonb not null default '[]'::jsonb;

update "public"."albums" as "albums"
set
  "release_group_id" = "release_groups"."id",
  "tracklist" = coalesce("albums"."tracks", '[]'::jsonb)
from "public"."release_groups" as "release_groups"
where "release_groups"."slug" = "albums"."slug";

alter table "public"."albums" alter column "release_group_id" set not null;

alter table "public"."albums" drop column "avg_rating";

alter table "public"."albums" drop column "created_at";

alter table "public"."albums" drop column "label";

alter table "public"."albums" drop column "last_synced_at";

alter table "public"."albums" drop column "release_date";

alter table "public"."albums" drop column "review_count";

alter table "public"."albums" drop column "slug";

alter table "public"."albums" drop column "spotify_id";

alter table "public"."albums" drop column "tracks";

alter table "public"."albums" drop column "artist";

alter table "public"."albums" alter column "images" set not null;

alter table "public"."artists" add column "images" jsonb not null default '[]'::jsonb;

update "public"."artists"
set "images" = case
  when "image_url" is null then '[]'::jsonb
  else jsonb_build_array(jsonb_build_object('url', "image_url"))
end;

alter table "public"."artists" drop column "created_at";

alter table "public"."artists" drop column "image_url";

alter table "public"."artists" drop column "last_synced_at";

alter table "public"."artists" drop column "spotify_id";

alter table "public"."reviews" add column "body" text;

alter table "public"."reviews" add column "favorite_track" text;

alter table "public"."reviews" add column "release_group_id" uuid;

update "public"."reviews"
set
  "body" = "review_text",
  "favorite_track" = "favorite_track_id";

update "public"."reviews" as "reviews"
set "release_group_id" = "albums"."release_group_id"
from "public"."albums" as "albums"
where "albums"."id" = "reviews"."album_id";

alter table "public"."reviews" alter column "release_group_id" set not null;

alter table "public"."reviews" drop column "album_id";

alter table "public"."reviews" drop column "favorite_track_id";

alter table "public"."reviews" drop column "review_text";

drop table "public"."profiles";

drop table "public"."waitlist";

CREATE UNIQUE INDEX artists_slug_key ON public.artists USING btree (slug);

CREATE UNIQUE INDEX favorites_pkey ON public.favorites USING btree (id);

CREATE UNIQUE INDEX favorites_user_id_position_key ON public.favorites USING btree (user_id, "position");

CREATE UNIQUE INDEX favorites_user_id_release_group_id_key ON public.favorites USING btree (user_id, release_group_id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (follower_id, followed_id);

CREATE INDEX idx_albums_release_group_id ON public.albums USING btree (release_group_id);

CREATE INDEX idx_favorites_release_group_id ON public.favorites USING btree (release_group_id);

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);

CREATE INDEX idx_follows_followed_id ON public.follows USING btree (followed_id);

CREATE INDEX idx_mappings_artist_id ON public.mappings USING btree (artist_id);

CREATE INDEX idx_mappings_release_group_id ON public.mappings USING btree (release_group_id);

CREATE INDEX idx_release_groups_artist_id ON public.release_groups USING btree (artist_id);

CREATE INDEX idx_reviews_release_group_id ON public.reviews USING btree (release_group_id);

CREATE UNIQUE INDEX mappings_pkey ON public.mappings USING btree (id);

CREATE UNIQUE INDEX mappings_provider_name_provider_id_key ON public.mappings USING btree (provider_name, provider_id);

CREATE UNIQUE INDEX release_groups_mb_group_id_key ON public.release_groups USING btree (mb_group_id);

CREATE UNIQUE INDEX release_groups_pkey ON public.release_groups USING btree (id);

CREATE UNIQUE INDEX release_groups_slug_key ON public.release_groups USING btree (slug);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."favorites" add constraint "favorites_pkey" PRIMARY KEY using index "favorites_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."mappings" add constraint "mappings_pkey" PRIMARY KEY using index "mappings_pkey";

alter table "public"."release_groups" add constraint "release_groups_pkey" PRIMARY KEY using index "release_groups_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."albums" add constraint "albums_release_group_id_fkey" FOREIGN KEY (release_group_id) REFERENCES public.release_groups(id) ON DELETE CASCADE not valid;

alter table "public"."albums" validate constraint "albums_release_group_id_fkey";

alter table "public"."artists" add constraint "artists_slug_key" UNIQUE using index "artists_slug_key";

alter table "public"."favorites" add constraint "favorites_position_check" CHECK ((("position" >= 1) AND ("position" <= 10))) not valid;

alter table "public"."favorites" validate constraint "favorites_position_check";

alter table "public"."favorites" add constraint "favorites_release_group_id_fkey" FOREIGN KEY (release_group_id) REFERENCES public.release_groups(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_release_group_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_user_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_position_key" UNIQUE using index "favorites_user_id_position_key";

alter table "public"."favorites" add constraint "favorites_user_id_release_group_id_key" UNIQUE using index "favorites_user_id_release_group_id_key";

alter table "public"."follows" add constraint "follows_followed_id_fkey" FOREIGN KEY (followed_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_followed_id_fkey";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_no_self_follow_check" CHECK ((follower_id <> followed_id)) not valid;

alter table "public"."follows" validate constraint "follows_no_self_follow_check";

alter table "public"."mappings" add constraint "mappings_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE not valid;

alter table "public"."mappings" validate constraint "mappings_artist_id_fkey";

alter table "public"."mappings" add constraint "mappings_exactly_one_target_check" CHECK ((((artist_id IS NOT NULL) AND (release_group_id IS NULL)) OR ((artist_id IS NULL) AND (release_group_id IS NOT NULL)))) not valid;

alter table "public"."mappings" validate constraint "mappings_exactly_one_target_check";

alter table "public"."mappings" add constraint "mappings_provider_name_provider_id_key" UNIQUE using index "mappings_provider_name_provider_id_key";

alter table "public"."mappings" add constraint "mappings_release_group_id_fkey" FOREIGN KEY (release_group_id) REFERENCES public.release_groups(id) ON DELETE CASCADE not valid;

alter table "public"."mappings" validate constraint "mappings_release_group_id_fkey";

alter table "public"."release_groups" add constraint "release_groups_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE not valid;

alter table "public"."release_groups" validate constraint "release_groups_artist_id_fkey";

alter table "public"."release_groups" add constraint "release_groups_mb_group_id_key" UNIQUE using index "release_groups_mb_group_id_key";

alter table "public"."release_groups" add constraint "release_groups_slug_key" UNIQUE using index "release_groups_slug_key";

alter table "public"."release_groups" add constraint "release_groups_type_check" CHECK ((type = ANY (ARRAY['album'::text, 'ep'::text, 'single'::text]))) not valid;

alter table "public"."release_groups" validate constraint "release_groups_type_check";

alter table "public"."reviews" add constraint "reviews_release_group_id_fkey" FOREIGN KEY (release_group_id) REFERENCES public.release_groups(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_release_group_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text]))) not valid;

alter table "public"."users" validate constraint "users_status_check";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 0.5) AND (rating <= 5.0) AND ((((rating * (10)::numeric))::integer % 5) = 0))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, username, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'pending'
  );
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."favorites" to "anon";

grant insert on table "public"."favorites" to "anon";

grant references on table "public"."favorites" to "anon";

grant select on table "public"."favorites" to "anon";

grant trigger on table "public"."favorites" to "anon";

grant truncate on table "public"."favorites" to "anon";

grant update on table "public"."favorites" to "anon";

grant delete on table "public"."favorites" to "authenticated";

grant insert on table "public"."favorites" to "authenticated";

grant references on table "public"."favorites" to "authenticated";

grant select on table "public"."favorites" to "authenticated";

grant trigger on table "public"."favorites" to "authenticated";

grant truncate on table "public"."favorites" to "authenticated";

grant update on table "public"."favorites" to "authenticated";

grant delete on table "public"."favorites" to "service_role";

grant insert on table "public"."favorites" to "service_role";

grant references on table "public"."favorites" to "service_role";

grant select on table "public"."favorites" to "service_role";

grant trigger on table "public"."favorites" to "service_role";

grant truncate on table "public"."favorites" to "service_role";

grant update on table "public"."favorites" to "service_role";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";

grant delete on table "public"."mappings" to "anon";

grant insert on table "public"."mappings" to "anon";

grant references on table "public"."mappings" to "anon";

grant select on table "public"."mappings" to "anon";

grant trigger on table "public"."mappings" to "anon";

grant truncate on table "public"."mappings" to "anon";

grant update on table "public"."mappings" to "anon";

grant delete on table "public"."mappings" to "authenticated";

grant insert on table "public"."mappings" to "authenticated";

grant references on table "public"."mappings" to "authenticated";

grant select on table "public"."mappings" to "authenticated";

grant trigger on table "public"."mappings" to "authenticated";

grant truncate on table "public"."mappings" to "authenticated";

grant update on table "public"."mappings" to "authenticated";

grant delete on table "public"."mappings" to "service_role";

grant insert on table "public"."mappings" to "service_role";

grant references on table "public"."mappings" to "service_role";

grant select on table "public"."mappings" to "service_role";

grant trigger on table "public"."mappings" to "service_role";

grant truncate on table "public"."mappings" to "service_role";

grant update on table "public"."mappings" to "service_role";

grant delete on table "public"."release_groups" to "anon";

grant insert on table "public"."release_groups" to "anon";

grant references on table "public"."release_groups" to "anon";

grant select on table "public"."release_groups" to "anon";

grant trigger on table "public"."release_groups" to "anon";

grant truncate on table "public"."release_groups" to "anon";

grant update on table "public"."release_groups" to "anon";

grant delete on table "public"."release_groups" to "authenticated";

grant insert on table "public"."release_groups" to "authenticated";

grant references on table "public"."release_groups" to "authenticated";

grant select on table "public"."release_groups" to "authenticated";

grant trigger on table "public"."release_groups" to "authenticated";

grant truncate on table "public"."release_groups" to "authenticated";

grant update on table "public"."release_groups" to "authenticated";

grant delete on table "public"."release_groups" to "service_role";

grant insert on table "public"."release_groups" to "service_role";

grant references on table "public"."release_groups" to "service_role";

grant select on table "public"."release_groups" to "service_role";

grant trigger on table "public"."release_groups" to "service_role";

grant truncate on table "public"."release_groups" to "service_role";

grant update on table "public"."release_groups" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Favorites are viewable by everyone"
  on "public"."favorites"
  as permissive
  for select
  to public
using (true);



  create policy "Users can create their own favorites"
  on "public"."favorites"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can delete their own favorites"
  on "public"."favorites"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can update their own favorites"
  on "public"."favorites"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Follows are viewable by everyone"
  on "public"."follows"
  as permissive
  for select
  to public
using (true);



  create policy "Users can follow from their own account"
  on "public"."follows"
  as permissive
  for insert
  to public
with check ((auth.uid() = follower_id));



  create policy "Users can unfollow from their own account"
  on "public"."follows"
  as permissive
  for delete
  to public
using ((auth.uid() = follower_id));



  create policy "Anyone can create mappings"
  on "public"."mappings"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update mappings"
  on "public"."mappings"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Mappings are viewable by everyone"
  on "public"."mappings"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can create release groups"
  on "public"."release_groups"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update release groups"
  on "public"."release_groups"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Release groups are viewable by everyone"
  on "public"."release_groups"
  as permissive
  for select
  to public
using (true);



  create policy "Active users are viewable by everyone"
  on "public"."users"
  as permissive
  for select
  to public
using (((status = 'active'::text) OR (auth.uid() = id)));



  create policy "Users can update their own user row"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Anyone can update albums"
  on "public"."albums"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Anyone can update artists"
  on "public"."artists"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Users can update their own reviews"
  on "public"."reviews"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

