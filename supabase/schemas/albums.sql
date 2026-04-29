-- Specific release records for canonical release groups
CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "release_group_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "tracklist" jsonb DEFAULT '[]'::jsonb NOT NULL
);

ALTER TABLE "public"."albums" OWNER TO "postgres";

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_release_group_id_fkey" FOREIGN KEY ("release_group_id") REFERENCES "public"."release_groups"("id") ON DELETE CASCADE;

CREATE INDEX "idx_albums_release_group_id" ON "public"."albums" USING "btree" ("release_group_id");
