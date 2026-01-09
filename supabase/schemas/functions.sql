-- Auto-creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

-- Recalculates album avg_rating and review_count when reviews change
CREATE OR REPLACE FUNCTION "public"."update_album_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  album_uuid UUID;
BEGIN
  -- Determine which album to update
  IF TG_OP = 'DELETE' THEN
    album_uuid := OLD.album_id;
  ELSE
    album_uuid := NEW.album_id;
  END IF;

  -- Update album stats
  UPDATE albums
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE album_id = album_uuid
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE album_id = album_uuid
    )
  WHERE id = album_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$;

ALTER FUNCTION "public"."update_album_stats"() OWNER TO "postgres";

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
