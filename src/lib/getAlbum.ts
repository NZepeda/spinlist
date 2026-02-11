import { resolveAlbumSlug } from "./slugs/resolveAlbumSlug";
import { createClient } from "./supabase/server";
import { Database } from "./types/database.types";

type Album = Omit<
  Database["public"]["Tables"]["albums"]["Row"],
  "created_at" | "last_synced_at" | "tracks"
> & {
  tracks: {
    id: string;
    name: string;
    track_number: number;
    duration_ms: number;
  }[];
};

/**
 * Returns the database entry for the album of the given slug.
 * Attempts to retrieve from our database first, and falls back to Spotify if it cannot be found.
 *
 * @param slug - The album's URL-friendly slug
 * @returns The album data, or undefined if not found
 */
export async function getAlbum(slug: string): Promise<Album | undefined> {
  const supabase = await createClient();

  const album = await resolveAlbumSlug(supabase, slug);

  if (!album) {
    // We cannot resolve the URL being accessed if we don't have the slug
    return undefined;
  }

  // TODO Fix this type casting
  // @ts-expect-error tracks type mismatch with Json
  return album;
}
