-- Canonical artist records referenced by album credits
CREATE TABLE IF NOT EXISTS "public"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "spotify_id" "text" NOT NULL,
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "slug" "text" NOT NULL,
    "discography_last_synced_at" timestamp with time zone
);

ALTER TABLE "public"."artists" OWNER TO "postgres";

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_spotify_id_key" UNIQUE ("spotify_id");

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_slug_key" UNIQUE ("slug");
