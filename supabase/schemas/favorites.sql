-- Ranked favorites tied to albums
CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "album_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "favorites_position_check" CHECK ((("position" >= 1) AND ("position" <= 10)))
);

ALTER TABLE "public"."favorites" OWNER TO "postgres";

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_position_key" UNIQUE ("user_id", "position");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_album_id_key" UNIQUE ("user_id", "album_id");

CREATE INDEX "idx_favorites_album_id" ON "public"."favorites" USING "btree" ("album_id");
CREATE INDEX "idx_favorites_user_id" ON "public"."favorites" USING "btree" ("user_id");
