import { SupabaseClient } from "@supabase/supabase-js";
import { isId } from "../slugs/isId";
import { resolveArtistSlug } from "../slugs/resolveArtistSlug";
import { resolveAlbumSlug } from "../slugs/resolveAlbumSlug";

/**
 * Returns the items's Spotify ID from the given slug.
 */
export const getSpotifyIdFromSlug = async (
  slug: string,
  {
    supabase,
    itemType,
  }: { supabase: SupabaseClient; itemType: "artist" | "album" },
): Promise<string | null> => {
  if (isId(slug)) {
    return slug;
  }

  const resolveSlug =
    itemType === "artist" ? resolveArtistSlug : resolveAlbumSlug;
  const result = await resolveSlug(supabase, slug);

  return result?.spotify_id ?? null;
};
