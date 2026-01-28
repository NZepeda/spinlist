alter table "public"."albums" drop column "cover_url";

alter table "public"."albums" add column "images" jsonb default '[]'::jsonb;


