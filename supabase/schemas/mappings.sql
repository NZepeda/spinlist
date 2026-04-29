-- Provider-specific IDs linked to canonical artists or release groups
CREATE TABLE IF NOT EXISTS "public"."mappings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid",
    "release_group_id" "uuid",
    "provider_name" "text" NOT NULL,
    "provider_id" "text" NOT NULL,
    "upc" "text",
    CONSTRAINT "mappings_exactly_one_target_check" CHECK (((("artist_id" IS NOT NULL) AND ("release_group_id" IS NULL)) OR (("artist_id" IS NULL) AND ("release_group_id" IS NOT NULL))))
);

ALTER TABLE "public"."mappings" OWNER TO "postgres";

ALTER TABLE ONLY "public"."mappings"
    ADD CONSTRAINT "mappings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."mappings"
    ADD CONSTRAINT "mappings_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mappings"
    ADD CONSTRAINT "mappings_release_group_id_fkey" FOREIGN KEY ("release_group_id") REFERENCES "public"."release_groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."mappings"
    ADD CONSTRAINT "mappings_provider_name_provider_id_key" UNIQUE ("provider_name", "provider_id");

CREATE INDEX "idx_mappings_artist_id" ON "public"."mappings" USING "btree" ("artist_id");
CREATE INDEX "idx_mappings_release_group_id" ON "public"."mappings" USING "btree" ("release_group_id");
