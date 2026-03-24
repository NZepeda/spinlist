import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";
import { getArtistAlbumsFromSpotify } from "@/server/spotify/getArtistAlbumsFromSpotify";
import { imagesToJson } from "@/server/spotify/imagesToJson";
import { generateSlug } from "@/server/slugs/generateSlug";
import { findAvailableSlug } from "@/server/slugs/findAvailableSlug";

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
      const baseSlug = generateSlug(`${album.artistName}-${album.name}`);
      const slug = await findAvailableSlug(supabase, "albums", baseSlug);

      rows.push({
        spotify_id: album.id,
        title: album.name,
        artist: album.artistName,
        release_date: album.releaseDate,
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
