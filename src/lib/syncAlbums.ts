import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { getArtistAlbumsFromSpotify } from "@/lib/spotify/getArtistAlbumsFromSpotify";
import { imagesToJson } from "@/lib/spotify/imagesToJson";
import { generateSlug } from "@/lib/slugs/generateSlug";
import { findAvailableSlug } from "@/lib/slugs/findAvailableSlug";

/**
 * Syncs an artist's albums from Spotify into the database.
 * Fetches simplified album data (no tracks) and upserts them in a single batch.
 * Tracks are fetched lazily when a user visits a specific album via getOrCreateAlbumSlug.
 *
 * This function is designed to be called fire-and-forget — errors are logged, never propagated.
 */
export async function syncAlbums(
  supabase: SupabaseClient<Database>,
  artistSpotifyId: string,
): Promise<void> {
  try {
    const albums = await getArtistAlbumsFromSpotify(artistSpotifyId);

    if (albums.length === 0) {
      return;
    }

    // Generate unique slugs for each album
    const rows = [];
    for (const album of albums) {
      const baseSlug = generateSlug(`${album.artist}-${album.name}`);
      const slug = await findAvailableSlug(supabase, "albums", baseSlug);

      rows.push({
        spotify_id: album.id,
        title: album.name,
        artist: album.artist,
        release_date: album.release_date,
        images: imagesToJson(album.images),
        last_synced_at: new Date().toISOString(),
        slug,
        label: album.label,
      });
    }

    const { error } = await supabase
      .from("albums")
      .upsert(rows, { onConflict: "spotify_id", ignoreDuplicates: true });

    if (error) {
      console.error("[syncAlbums] Failed to upsert albums:", error.message);
    }
  } catch (err) {
    console.error("[syncAlbums] Error syncing albums:", err);
  }
}
