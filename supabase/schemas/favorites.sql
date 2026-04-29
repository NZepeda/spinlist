-- Ranked profile favorites tied to canonical release groups
CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "release_group_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "favorites_position_check" CHECK ((("position" >= 1) AND ("position" <= 10)))
);

ALTER TABLE "public"."favorites" OWNER TO "postgres";

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_release_group_id_fkey" FOREIGN KEY ("release_group_id") REFERENCES "public"."release_groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_position_key" UNIQUE ("user_id", "position");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_release_group_id_key" UNIQUE ("user_id", "release_group_id");

CREATE INDEX "idx_favorites_release_group_id" ON "public"."favorites" USING "btree" ("release_group_id");
CREATE INDEX "idx_favorites_user_id" ON "public"."favorites" USING "btree" ("user_id");
