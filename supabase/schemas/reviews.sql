-- User reviews for albums
CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "album_id" "uuid" NOT NULL,
    "rating" numeric(2,1) NOT NULL,
    "review_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1.0) AND ("rating" <= 5.0)))
);

ALTER TABLE "public"."reviews" OWNER TO "postgres";

-- Primary key and unique constraints
ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_album_id_key" UNIQUE ("user_id", "album_id");

-- Foreign keys
ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX "idx_reviews_album_id" ON "public"."reviews" USING "btree" ("album_id");
CREATE INDEX "idx_reviews_created_at" ON "public"."reviews" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");
