-- URL-friendly slugs for artists
CREATE TABLE IF NOT EXISTS "public"."artist_slugs" (
    "slug" "text" NOT NULL,
    "spotify_id" "text" NOT NULL,
    "artist_id" "uuid" NOT NULL
);

ALTER TABLE "public"."artist_slugs" OWNER TO "postgres";

-- Primary key and unique constraints
ALTER TABLE ONLY "public"."artist_slugs"
    ADD CONSTRAINT "artist_slugs_pkey" PRIMARY KEY ("slug");

ALTER TABLE ONLY "public"."artist_slugs"
    ADD CONSTRAINT "artist_slugs_spotify_id_key" UNIQUE ("spotify_id");

-- Foreign keys
ALTER TABLE ONLY "public"."artist_slugs"
    ADD CONSTRAINT "artist_slugs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;
