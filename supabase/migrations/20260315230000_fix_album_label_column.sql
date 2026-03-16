alter table "public"."albums"
  add column if not exists "label" text;

update "public"."albums"
set "label" = ''
where "label" is null;

alter table "public"."albums"
  alter column "label" set not null;
