alter table "public"."release_groups"
alter column "mb_group_id" drop not null;

create table "public"."release_group_artists" (
    "release_group_id" uuid not null,
    "artist_id" uuid not null,
    "position" integer not null
);

alter table "public"."release_group_artists" enable row level security;

CREATE UNIQUE INDEX release_group_artists_pkey ON public.release_group_artists USING btree (release_group_id, artist_id);

CREATE UNIQUE INDEX release_group_artists_release_group_id_position_key ON public.release_group_artists USING btree (release_group_id, "position");

CREATE INDEX idx_release_group_artists_artist_id ON public.release_group_artists USING btree (artist_id);

CREATE INDEX idx_release_group_artists_release_group_id ON public.release_group_artists USING btree (release_group_id);

alter table "public"."release_group_artists" add constraint "release_group_artists_pkey" PRIMARY KEY using index "release_group_artists_pkey";

alter table "public"."release_group_artists" add constraint "release_group_artists_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE not valid;

alter table "public"."release_group_artists" validate constraint "release_group_artists_artist_id_fkey";

alter table "public"."release_group_artists" add constraint "release_group_artists_release_group_id_fkey" FOREIGN KEY (release_group_id) REFERENCES public.release_groups(id) ON DELETE CASCADE not valid;

alter table "public"."release_group_artists" validate constraint "release_group_artists_release_group_id_fkey";

alter table "public"."release_group_artists" add constraint "release_group_artists_release_group_id_position_key" UNIQUE using index "release_group_artists_release_group_id_position_key";

grant all on table "public"."release_group_artists" to "anon";
grant all on table "public"."release_group_artists" to "authenticated";
grant all on table "public"."release_group_artists" to "service_role";

create policy "Release group artists are viewable by everyone"
on "public"."release_group_artists"
as permissive
for select
to public
using (true);

create policy "Anyone can create release group artists"
on "public"."release_group_artists"
as permissive
for insert
to public
with check (true);

create policy "Anyone can update release group artists"
on "public"."release_group_artists"
as permissive
for update
to public
using (true)
with check (true);
