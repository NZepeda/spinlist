-- Canonical album-group records anchored to MusicBrainz
CREATE TABLE IF NOT EXISTS "public"."release_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "original_release_year" integer,
    "mb_group_id" "text",
    "slug" "text" NOT NULL
);

ALTER TABLE "public"."release_groups" OWNER TO "postgres";

ALTER TABLE ONLY "public"."release_groups"
    ADD CONSTRAINT "release_groups_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."release_groups"
    ADD CONSTRAINT "release_groups_mb_group_id_key" UNIQUE ("mb_group_id");

ALTER TABLE ONLY "public"."release_groups"
    ADD CONSTRAINT "release_groups_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."release_groups"
    ADD CONSTRAINT "release_groups_type_check" CHECK (("type" = ANY (ARRAY['album'::text, 'ep'::text, 'single'::text])));
