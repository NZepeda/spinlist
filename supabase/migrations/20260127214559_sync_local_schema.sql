
  create table "public"."album_slugs" (
    "slug" text not null,
    "spotify_id" text not null,
    "album_id" uuid not null
      );


alter table "public"."album_slugs" enable row level security;


  create table "public"."artist_slugs" (
    "slug" text not null,
    "spotify_id" text not null,
    "artist_id" uuid not null
      );


alter table "public"."artist_slugs" enable row level security;

alter table "public"."albums" alter column "tracks" set default '[]'::jsonb;

alter table "public"."reviews" add column "favorite_track_id" text;

CREATE UNIQUE INDEX album_slugs_pkey ON public.album_slugs USING btree (slug);

CREATE UNIQUE INDEX album_slugs_spotify_id_key ON public.album_slugs USING btree (spotify_id);

CREATE UNIQUE INDEX artist_slugs_pkey ON public.artist_slugs USING btree (slug);

CREATE UNIQUE INDEX artist_slugs_spotify_id_key ON public.artist_slugs USING btree (spotify_id);

alter table "public"."album_slugs" add constraint "album_slugs_pkey" PRIMARY KEY using index "album_slugs_pkey";

alter table "public"."artist_slugs" add constraint "artist_slugs_pkey" PRIMARY KEY using index "artist_slugs_pkey";

alter table "public"."album_slugs" add constraint "album_slugs_album_id_fkey" FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE not valid;

alter table "public"."album_slugs" validate constraint "album_slugs_album_id_fkey";

alter table "public"."album_slugs" add constraint "album_slugs_spotify_id_key" UNIQUE using index "album_slugs_spotify_id_key";

alter table "public"."artist_slugs" add constraint "artist_slugs_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE not valid;

alter table "public"."artist_slugs" validate constraint "artist_slugs_artist_id_fkey";

alter table "public"."artist_slugs" add constraint "artist_slugs_spotify_id_key" UNIQUE using index "artist_slugs_spotify_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."album_slugs" to "anon";

grant insert on table "public"."album_slugs" to "anon";

grant references on table "public"."album_slugs" to "anon";

grant select on table "public"."album_slugs" to "anon";

grant trigger on table "public"."album_slugs" to "anon";

grant truncate on table "public"."album_slugs" to "anon";

grant update on table "public"."album_slugs" to "anon";

grant delete on table "public"."album_slugs" to "authenticated";

grant insert on table "public"."album_slugs" to "authenticated";

grant references on table "public"."album_slugs" to "authenticated";

grant select on table "public"."album_slugs" to "authenticated";

grant trigger on table "public"."album_slugs" to "authenticated";

grant truncate on table "public"."album_slugs" to "authenticated";

grant update on table "public"."album_slugs" to "authenticated";

grant delete on table "public"."album_slugs" to "service_role";

grant insert on table "public"."album_slugs" to "service_role";

grant references on table "public"."album_slugs" to "service_role";

grant select on table "public"."album_slugs" to "service_role";

grant trigger on table "public"."album_slugs" to "service_role";

grant truncate on table "public"."album_slugs" to "service_role";

grant update on table "public"."album_slugs" to "service_role";

grant delete on table "public"."artist_slugs" to "anon";

grant insert on table "public"."artist_slugs" to "anon";

grant references on table "public"."artist_slugs" to "anon";

grant select on table "public"."artist_slugs" to "anon";

grant trigger on table "public"."artist_slugs" to "anon";

grant truncate on table "public"."artist_slugs" to "anon";

grant update on table "public"."artist_slugs" to "anon";

grant delete on table "public"."artist_slugs" to "authenticated";

grant insert on table "public"."artist_slugs" to "authenticated";

grant references on table "public"."artist_slugs" to "authenticated";

grant select on table "public"."artist_slugs" to "authenticated";

grant trigger on table "public"."artist_slugs" to "authenticated";

grant truncate on table "public"."artist_slugs" to "authenticated";

grant update on table "public"."artist_slugs" to "authenticated";

grant delete on table "public"."artist_slugs" to "service_role";

grant insert on table "public"."artist_slugs" to "service_role";

grant references on table "public"."artist_slugs" to "service_role";

grant select on table "public"."artist_slugs" to "service_role";

grant trigger on table "public"."artist_slugs" to "service_role";

grant truncate on table "public"."artist_slugs" to "service_role";

grant update on table "public"."artist_slugs" to "service_role";


  create policy "Album slugs are viewable by everyone"
  on "public"."album_slugs"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can create album slugs"
  on "public"."album_slugs"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Artist slugs are viewable by everyone"
  on "public"."artist_slugs"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can create artist slugs"
  on "public"."artist_slugs"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



