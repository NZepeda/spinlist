-- Album information cached from Spotify
CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spotify_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "artist" "text" NOT NULL,
    "release_date" "date",
    "images" jsonb DEFAULT '[]'::jsonb,
    "avg_rating" numeric(3,2) DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tracks" jsonb DEFAULT '[]'::jsonb,
    "slug" "text" NOT NULL,
    "label" "text" NOT NULL,
    CONSTRAINT "albums_avg_rating_check" CHECK ((("avg_rating" >= (0)::numeric) AND ("avg_rating" <= (5)::numeric))),
    CONSTRAINT "albums_review_count_check" CHECK (("review_count" >= 0))
);

ALTER TABLE "public"."albums" OWNER TO "postgres";

-- Primary key and unique constraints
ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_spotify_id_key" UNIQUE ("spotify_id");

-- Indexes for performance
CREATE INDEX "idx_albums_avg_rating" ON "public"."albums" USING "btree" ("avg_rating" DESC);
CREATE INDEX "idx_albums_review_count" ON "public"."albums" USING "btree" ("review_count" DESC);
CREATE INDEX "idx_albums_spotify_id" ON "public"."albums" USING "btree" ("spotify_id");
CREATE UNIQUE INDEX "idx_albums_slug" ON "public"."albums" ("slug");
