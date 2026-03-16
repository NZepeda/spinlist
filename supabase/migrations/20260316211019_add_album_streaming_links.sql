alter table "public"."albums" add column "streaming_links" jsonb not null default '{}'::jsonb;

alter table "public"."albums" add column "streaming_links_synced_at" timestamp with time zone;


