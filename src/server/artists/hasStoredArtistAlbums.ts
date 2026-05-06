import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Returns whether an artist already has at least one stored album credit.
 *
 * @param supabase - The Supabase client used to query stored album credits.
 * @param artistId - The canonical artist identifier.
 * @returns Whether the artist already has at least one related album.
 */
export async function hasStoredArtistAlbums(
  supabase: SupabaseClient<Database>,
  artistId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("album_artists")
    .select("album_id")
    .eq("artist_id", artistId)
    .limit(1);

  if (error) {
    throw new SupabaseDependencyError({
      message: `Failed to inspect artist albums: ${error.message}`,
      operation: "select",
      resource: "album_artists",
      cause: error,
    });
  }

  return data.length > 0;
}
