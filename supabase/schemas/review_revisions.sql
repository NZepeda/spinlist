-- Immutable review history snapshots
CREATE TABLE IF NOT EXISTS "public"."review_revisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "album_id" "uuid" NOT NULL,
    "rating" numeric(2,1) NOT NULL,
    "favorite_track" "text",
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "review_revisions_rating_check" CHECK ((("rating" >= 0.5) AND ("rating" <= 5.0) AND ((((("rating" * 10))::integer % 5) = 0))))
);

ALTER TABLE "public"."review_revisions" OWNER TO "postgres";

ALTER TABLE ONLY "public"."review_revisions"
    ADD CONSTRAINT "review_revisions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."review_revisions"
    ADD CONSTRAINT "review_revisions_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."review_revisions"
    ADD CONSTRAINT "review_revisions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."review_revisions"
    ADD CONSTRAINT "review_revisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE INDEX "idx_review_revisions_album_id" ON "public"."review_revisions" USING "btree" ("album_id");
CREATE INDEX "idx_review_revisions_created_at" ON "public"."review_revisions" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_review_revisions_review_id" ON "public"."review_revisions" USING "btree" ("review_id");
CREATE INDEX "idx_review_revisions_user_id" ON "public"."review_revisions" USING "btree" ("user_id");
