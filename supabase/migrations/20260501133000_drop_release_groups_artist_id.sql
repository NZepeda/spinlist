alter table "public"."release_groups"
drop constraint "release_groups_artist_id_fkey";

drop index "public"."idx_release_groups_artist_id";

alter table "public"."release_groups"
drop column "artist_id";
