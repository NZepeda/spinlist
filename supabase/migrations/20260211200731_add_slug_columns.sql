alter table "public"."albums" add column "slug" text;

alter table "public"."artists" add column "slug" text;

CREATE UNIQUE INDEX idx_albums_slug ON public.albums USING btree (slug) WHERE (slug IS NOT NULL);

CREATE UNIQUE INDEX idx_artists_slug ON public.artists USING btree (slug) WHERE (slug IS NOT NULL);


