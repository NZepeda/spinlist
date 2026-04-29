-- Canonical artist records used across providers
CREATE TABLE IF NOT EXISTS "public"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "slug" "text" NOT NULL
);

ALTER TABLE "public"."artists" OWNER TO "postgres";

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_slug_key" UNIQUE ("slug");
