-- Creates a public user automatically when a new auth user signs up
CREATE OR REPLACE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."handle_new_user"();

-- Automatically updates updated_at on review changes
CREATE OR REPLACE TRIGGER "update_reviews_updated_at"
    BEFORE UPDATE ON "public"."reviews"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Stores review history after the current review row is saved
CREATE OR REPLACE TRIGGER "record_review_revision_on_write"
    AFTER INSERT OR UPDATE ON "public"."reviews"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."record_review_revision"();
