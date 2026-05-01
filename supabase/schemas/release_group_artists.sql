-- Ordered artist credits for canonical release groups
CREATE TABLE IF NOT EXISTS "public"."release_group_artists" (
    "release_group_id" "uuid" NOT NULL,
    "artist_id" "uuid" NOT NULL,
    "position" integer NOT NULL
);

ALTER TABLE "public"."release_group_artists" OWNER TO "postgres";

ALTER TABLE ONLY "public"."release_group_artists"
    ADD CONSTRAINT "release_group_artists_pkey" PRIMARY KEY ("release_group_id", "artist_id");

ALTER TABLE ONLY "public"."release_group_artists"
    ADD CONSTRAINT "release_group_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."release_group_artists"
    ADD CONSTRAINT "release_group_artists_release_group_id_fkey" FOREIGN KEY ("release_group_id") REFERENCES "public"."release_groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."release_group_artists"
    ADD CONSTRAINT "release_group_artists_release_group_id_position_key" UNIQUE ("release_group_id", "position");

CREATE INDEX "idx_release_group_artists_artist_id" ON "public"."release_group_artists" USING "btree" ("artist_id");
CREATE INDEX "idx_release_group_artists_release_group_id" ON "public"."release_group_artists" USING "btree" ("release_group_id");
