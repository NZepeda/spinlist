alter table "public"."profiles" add column "status" text not null default 'pending'::text;

alter table "public"."profiles" add constraint "profiles_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, status, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'pending',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$
;


