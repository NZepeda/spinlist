-- Enable Row Level Security on all tables
ALTER TABLE "public"."albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."artists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."release_group_artists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."release_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Active users are viewable by everyone" ON "public"."users" FOR SELECT USING ((("status" = 'active'::text) OR ("auth"."uid"() = "id")));
CREATE POLICY "Users can update their own user row" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));

-- Catalog policies
CREATE POLICY "Artists are viewable by everyone" ON "public"."artists" FOR SELECT USING (true);
CREATE POLICY "Anyone can create artists" ON "public"."artists" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update artists" ON "public"."artists" FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Release groups are viewable by everyone" ON "public"."release_groups" FOR SELECT USING (true);
CREATE POLICY "Anyone can create release groups" ON "public"."release_groups" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update release groups" ON "public"."release_groups" FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Albums are viewable by everyone" ON "public"."albums" FOR SELECT USING (true);
CREATE POLICY "Anyone can create albums" ON "public"."albums" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update albums" ON "public"."albums" FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Mappings are viewable by everyone" ON "public"."mappings" FOR SELECT USING (true);
CREATE POLICY "Anyone can create mappings" ON "public"."mappings" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update mappings" ON "public"."mappings" FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Release group artists are viewable by everyone" ON "public"."release_group_artists" FOR SELECT USING (true);
CREATE POLICY "Anyone can create release group artists" ON "public"."release_group_artists" FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update release group artists" ON "public"."release_group_artists" FOR UPDATE USING (true) WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

-- Favorites policies
CREATE POLICY "Favorites are viewable by everyone" ON "public"."favorites" FOR SELECT USING (true);
CREATE POLICY "Users can create their own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own favorites" ON "public"."favorites" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON "public"."follows" FOR SELECT USING (true);
CREATE POLICY "Users can follow from their own account" ON "public"."follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));
CREATE POLICY "Users can unfollow from their own account" ON "public"."follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));
