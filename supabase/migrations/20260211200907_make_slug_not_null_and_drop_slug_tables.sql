drop policy "Album slugs are viewable by everyone" on "public"."album_slugs";

drop policy "Anyone can create album slugs" on "public"."album_slugs";

drop policy "Anyone can update album slugs" on "public"."album_slugs";

drop policy "Anyone can create artist slugs" on "public"."artist_slugs";

drop policy "Anyone can update artist slugs" on "public"."artist_slugs";

drop policy "Artist slugs are viewable by everyone" on "public"."artist_slugs";

revoke delete on table "public"."album_slugs" from "anon";

revoke insert on table "public"."album_slugs" from "anon";

revoke references on table "public"."album_slugs" from "anon";

revoke select on table "public"."album_slugs" from "anon";

revoke trigger on table "public"."album_slugs" from "anon";

revoke truncate on table "public"."album_slugs" from "anon";

revoke update on table "public"."album_slugs" from "anon";

revoke delete on table "public"."album_slugs" from "authenticated";

revoke insert on table "public"."album_slugs" from "authenticated";

revoke references on table "public"."album_slugs" from "authenticated";

revoke select on table "public"."album_slugs" from "authenticated";

revoke trigger on table "public"."album_slugs" from "authenticated";

revoke truncate on table "public"."album_slugs" from "authenticated";

revoke update on table "public"."album_slugs" from "authenticated";

revoke delete on table "public"."album_slugs" from "service_role";

revoke insert on table "public"."album_slugs" from "service_role";

revoke references on table "public"."album_slugs" from "service_role";

revoke select on table "public"."album_slugs" from "service_role";

revoke trigger on table "public"."album_slugs" from "service_role";

revoke truncate on table "public"."album_slugs" from "service_role";

revoke update on table "public"."album_slugs" from "service_role";

revoke delete on table "public"."artist_slugs" from "anon";

revoke insert on table "public"."artist_slugs" from "anon";

revoke references on table "public"."artist_slugs" from "anon";

revoke select on table "public"."artist_slugs" from "anon";

revoke trigger on table "public"."artist_slugs" from "anon";

revoke truncate on table "public"."artist_slugs" from "anon";

revoke update on table "public"."artist_slugs" from "anon";

revoke delete on table "public"."artist_slugs" from "authenticated";

revoke insert on table "public"."artist_slugs" from "authenticated";

revoke references on table "public"."artist_slugs" from "authenticated";

revoke select on table "public"."artist_slugs" from "authenticated";

revoke trigger on table "public"."artist_slugs" from "authenticated";

revoke truncate on table "public"."artist_slugs" from "authenticated";

revoke update on table "public"."artist_slugs" from "authenticated";

revoke delete on table "public"."artist_slugs" from "service_role";

revoke insert on table "public"."artist_slugs" from "service_role";

revoke references on table "public"."artist_slugs" from "service_role";

revoke select on table "public"."artist_slugs" from "service_role";

revoke trigger on table "public"."artist_slugs" from "service_role";

revoke truncate on table "public"."artist_slugs" from "service_role";

revoke update on table "public"."artist_slugs" from "service_role";

alter table "public"."album_slugs" drop constraint "album_slugs_album_id_fkey";

alter table "public"."album_slugs" drop constraint "album_slugs_spotify_id_key";

alter table "public"."artist_slugs" drop constraint "artist_slugs_artist_id_fkey";

alter table "public"."artist_slugs" drop constraint "artist_slugs_spotify_id_key";

alter table "public"."album_slugs" drop constraint "album_slugs_pkey";

alter table "public"."artist_slugs" drop constraint "artist_slugs_pkey";

drop index if exists "public"."album_slugs_pkey";

drop index if exists "public"."album_slugs_spotify_id_key";

drop index if exists "public"."artist_slugs_pkey";

drop index if exists "public"."artist_slugs_spotify_id_key";

drop index if exists "public"."idx_albums_slug";

drop index if exists "public"."idx_artists_slug";

drop table "public"."album_slugs";

drop table "public"."artist_slugs";

alter table "public"."albums" alter column "slug" set not null;

alter table "public"."artists" alter column "slug" set not null;

CREATE UNIQUE INDEX idx_albums_slug ON public.albums USING btree (slug);

CREATE UNIQUE INDEX idx_artists_slug ON public.artists USING btree (slug);


