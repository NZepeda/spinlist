import { SupabaseClient } from "@supabase/supabase-js";
import { startSpan } from "@/monitoring/startSpan";
import { isId } from "../slugs/isId";
import { resolveArtistSlug } from "../slugs/resolveArtistSlug";
import { resolveAlbumSlug } from "../slugs/resolveAlbumSlug";
import type { Database } from "@/server/database";

/**
 * Translates public album and artist slugs into their corresponding Spotify ids.
 */
export const getSpotifyIdFromSlug = async (
  slug: string,
  {
    supabase,
    itemType,
  }: { supabase: SupabaseClient<Database>; itemType: "artist" | "album" },
): Promise<string | null> => {
  if (isId(slug)) {
    return slug;
  }

  const resolveSlug =
    itemType === "artist" ? resolveArtistSlug : resolveAlbumSlug;
  const result = await startSpan(
    {
      name: `page.${itemType}.slug_lookup`,
      op: "db.supabase",
    },
    async () => await resolveSlug(supabase, slug),
  );

  return result?.spotify_id ?? null;
};
