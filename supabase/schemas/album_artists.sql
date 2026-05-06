-- Ordered artist credits for albums
CREATE TABLE IF NOT EXISTS "public"."album_artists" (
    "album_id" "uuid" NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "position" integer NOT NULL
);

ALTER TABLE "public"."album_artists" OWNER TO "postgres";

ALTER TABLE ONLY "public"."album_artists"
    ADD CONSTRAINT "album_artists_pkey" PRIMARY KEY ("album_id", "artist_id");

ALTER TABLE ONLY "public"."album_artists"
    ADD CONSTRAINT "album_artists_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."album_artists"
    ADD CONSTRAINT "album_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."album_artists"
    ADD CONSTRAINT "album_artists_album_id_position_key" UNIQUE ("album_id", "position");

CREATE INDEX "idx_album_artists_album_id" ON "public"."album_artists" USING "btree" ("album_id");
CREATE INDEX "idx_album_artists_artist_id" ON "public"."album_artists" USING "btree" ("artist_id");
