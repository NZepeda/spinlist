-- Enable Row Level Security on all tables
ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Albums are viewable by everyone" ON "public"."albums" FOR SELECT USING (true);
CREATE POLICY "Anyone can create albums" ON "public"."albums" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update albums" ON "public"."albums" FOR UPDATE USING (true);

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
CREATE POLICY "Anyone can create artists" ON "public"."artists" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update artists" ON "public"."artists" FOR UPDATE USING (true);

-- Waitlist policies
CREATE POLICY "Anyone can join waitlist" ON "public"."waitlist" FOR INSERT WITH CHECK (true);
