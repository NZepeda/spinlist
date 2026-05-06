-- Auto-creates a public user row when a new auth user signs up
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, username, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'pending'
  );
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

-- Auto-updates the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

-- Stores an immutable snapshot whenever a review is created or edited
CREATE OR REPLACE FUNCTION public.record_review_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.review_revisions (
    review_id,
    user_id,
    album_id,
    rating,
    favorite_track,
    body,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    NEW.album_id,
    NEW.rating,
    NEW.favorite_track,
    NEW.body,
    CASE
      WHEN TG_OP = 'INSERT' THEN NEW.created_at
      ELSE NEW.updated_at
    END
  );

  RETURN NEW;
END;
$function$
;

ALTER FUNCTION public.record_review_revision() OWNER TO "postgres";
