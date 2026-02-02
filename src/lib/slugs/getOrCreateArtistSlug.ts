import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/lib/types/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getArtist } from "../spotify/getArtist";
import { syncAlbums } from "../syncAlbums";

/**
 * Gets an existing slug or creates a new one for an artist.
 * Handles collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  artistSpotifyId: string,
): Promise<string> {
  // Check if slug already exists for this spotify_id
  const { data: slugRecord } = await supabase
    .from("artist_slugs")
    .select("slug")
    .eq("spotify_id", artistSpotifyId)
    .single();

  if (slugRecord) {
    return slugRecord.slug;
  }

  // The artist doesn't exist in the database yet.
  const artist = await getArtist(artistSpotifyId);

  const { data: artistRecord, error: artistError } = await supabase
    .from("artists")
    .upsert(
      {
        spotify_id: artistSpotifyId,
        name: artist.name,
        last_synced_at: new Date().toISOString(),
        image_url: artist.image,
      },
      { onConflict: "spotify_id" },
    )
    .select("id")
    .single();

  if (artistError || !artistRecord) {
    throw new Error(`Failed to upsert artist: ${artistError?.message}`);
  }

  // Generate base slug and find available variant
  const baseSlug = generateSlug(artist.name);
  const slug = await findAvailableSlug(supabase, "artist_slugs", baseSlug);

  const { error: insertError } = await supabase.from("artist_slugs").insert({
    slug,
    spotify_id: artistSpotifyId,
    artist_id: artistRecord.id,
  });

  if (insertError) {
    throw insertError;
  }

  // Fire-and-forget: sync the artist's albums in the background
  syncAlbums(supabase, artistSpotifyId);

  return slug;
}
