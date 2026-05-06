-- Albums that can be reviewed and favorited
CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spotify_id" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "release_year" integer,
    "upc" "text",
    "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "tracklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT "albums_type_check" CHECK (("type" = ANY (ARRAY['album'::text, 'ep'::text, 'single'::text])))
);

ALTER TABLE "public"."albums" OWNER TO "postgres";

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_spotify_id_key" UNIQUE ("spotify_id");

ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_slug_key" UNIQUE ("slug");
