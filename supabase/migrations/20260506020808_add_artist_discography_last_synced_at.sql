alter table "public"."artists" add column "discography_last_synced_at" timestamp with time zone;

set check_function_bodies = off;

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


