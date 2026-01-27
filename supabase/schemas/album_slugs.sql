-- URL-friendly slugs for albums
CREATE TABLE IF NOT EXISTS "public"."album_slugs" (
    "slug" "text" NOT NULL,
    "spotify_id" "text" NOT NULL,
    "album_id" "uuid" NOT NULL
);

ALTER TABLE "public"."album_slugs" OWNER TO "postgres";

-- Primary key and unique constraints
ALTER TABLE ONLY "public"."album_slugs"
    ADD CONSTRAINT "album_slugs_pkey" PRIMARY KEY ("slug");

ALTER TABLE ONLY "public"."album_slugs"
    ADD CONSTRAINT "album_slugs_spotify_id_key" UNIQUE ("spotify_id");

-- Foreign keys
ALTER TABLE ONLY "public"."album_slugs"
    ADD CONSTRAINT "album_slugs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;
