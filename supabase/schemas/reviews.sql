-- User reviews attached to canonical release groups
CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "release_group_id" "uuid" NOT NULL,
    "rating" numeric(2,1) NOT NULL,
    "favorite_track" "text",
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 0.5) AND ("rating" <= 5.0) AND ((((("rating" * 10))::integer % 5) = 0))))
);

ALTER TABLE "public"."reviews" OWNER TO "postgres";

ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_release_group_id_fkey" FOREIGN KEY ("release_group_id") REFERENCES "public"."release_groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE INDEX "idx_reviews_created_at" ON "public"."reviews" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_reviews_release_group_id" ON "public"."reviews" USING "btree" ("release_group_id");
CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");
