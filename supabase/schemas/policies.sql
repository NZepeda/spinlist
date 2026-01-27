-- Enable Row Level Security on all tables
ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artist_slugs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."album_slugs" ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Albums are viewable by everyone" ON "public"."albums" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create albums" ON "public"."albums" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));

-- Artists policies
CREATE POLICY "Artists are viewable by everyone" ON "public"."artists" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create artists" ON "public"."artists" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));
CREATE POLICY "Authenticated users can update artists" ON "public"."artists" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));

-- Artist slugs policies
CREATE POLICY "Artist slugs are viewable by everyone" ON "public"."artist_slugs" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create artist slugs" ON "public"."artist_slugs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Album slugs policies
CREATE POLICY "Album slugs are viewable by everyone" ON "public"."album_slugs" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create album slugs" ON "public"."album_slugs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));
