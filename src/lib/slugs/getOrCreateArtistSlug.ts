import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
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
  // Check if artist already exists with a slug
  const { data: existing } = await supabase
    .from("artists")
    .select("slug")
    .eq("spotify_id", artistSpotifyId)
    .single();

  if (existing) {
    return existing.slug;
  }

  // The artist doesn't exist in the database yet.
  const artist = await getArtist(artistSpotifyId);

  // Generate base slug and find available variant
  const baseSlug = generateSlug(artist.name);
  const slug = await findAvailableSlug(supabase, "artists", baseSlug);

  // Upsert artist record with slug included
  const { error: artistError } = await supabase.from("artists").upsert(
    {
      spotify_id: artistSpotifyId,
      name: artist.name,
      last_synced_at: new Date().toISOString(),
      image_url: artist.image,
      slug,
    },
    { onConflict: "spotify_id" },
  );

  if (artistError) {
    throw new Error(`Failed to upsert artist: ${artistError.message}`);
  }

  // Fire-and-forget: sync the artist's albums in the background
  void syncAlbums(supabase, artistSpotifyId);

  return slug;
}
