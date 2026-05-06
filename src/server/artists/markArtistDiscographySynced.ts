import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Records the time when an artist discography sync completed successfully.
 *
 * @param supabase - The Supabase client used for artist persistence.
 * @param artistId - The canonical artist identifier.
 * @param syncedAt - The successful sync time to store.
 */
export async function markArtistDiscographySynced(
  supabase: SupabaseClient<Database>,
  artistId: string,
  syncedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from("artists")
    .update({
      discography_last_synced_at: syncedAt,
    })
    .eq("id", artistId);

  if (error) {
    throw new SupabaseDependencyError({
      message: `Failed to mark artist discography sync: ${error.message}`,
      operation: "update",
      resource: "artists",
      cause: error,
    });
  }
}
