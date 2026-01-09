-- Creates a profile automatically when a new user signs up
CREATE OR REPLACE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."handle_new_user"();

-- Recalculates album statistics when reviews are added, updated, or deleted
CREATE OR REPLACE TRIGGER "update_album_stats_on_review_change"
    AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_album_stats"();

-- Automatically updates updated_at on profile changes
CREATE OR REPLACE TRIGGER "update_profiles_updated_at"
    BEFORE UPDATE ON "public"."profiles"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Automatically updates updated_at on review changes
CREATE OR REPLACE TRIGGER "update_reviews_updated_at"
    BEFORE UPDATE ON "public"."reviews"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();
