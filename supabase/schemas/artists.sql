-- Artist information cached from Spotify
CREATE TABLE IF NOT EXISTS "public"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spotify_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text",
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."artists" OWNER TO "postgres";

-- Primary key and unique constraints
ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."artists"
    ADD CONSTRAINT "artists_spotify_id_key" UNIQUE ("spotify_id");

-- Indexes for performance
CREATE INDEX "idx_artists_spotify_id" ON "public"."artists" USING "btree" ("spotify_id");
CREATE UNIQUE INDEX "idx_artists_slug" ON "public"."artists" ("slug");
