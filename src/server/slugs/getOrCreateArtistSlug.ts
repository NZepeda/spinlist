import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/server/database";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getSpotifyArtist } from "../spotify/getSpotifyArtist";
import { imagesToJson } from "../spotify/imagesToJson";
import { SupabaseDependencyError } from "../supabase/SupabaseDependencyError";

/**
 * Gets an existing slug or creates a new one for an artist.
 *
 * When the artist is new, fetches details from Spotify and creates the canonical artist record before returning the slug.
 * Handles slug collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  artistSpotifyId: string,
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("artists")
    .select("slug")
    .eq("spotify_id", artistSpotifyId)
    .maybeSingle();

  if (existingError) {
    throw new SupabaseDependencyError({
      message: `Failed to query existing artist: ${existingError.message}`,
      operation: "select",
      resource: "artists",
      cause: existingError,
    });
  }

  if (existing !== null) {
    return existing.slug;
  }

  // The artist doesn't exist in the database yet.
  // Fetch from Spotify to get the name and images needed to create the canonical record.
  const spotifyArtist = await getSpotifyArtist(artistSpotifyId);

  if (!spotifyArtist) {
    throw new Error(`Artist not found on Spotify: ${artistSpotifyId}`);
  }

  const baseSlug = generateSlug(spotifyArtist.name);
  const slug = await findAvailableSlug(supabase, "artists", baseSlug);

  const artistInsert: TablesInsert<"artists"> = {
    images: imagesToJson(spotifyArtist.images ?? []),
    name: spotifyArtist.name,
    slug,
    spotify_id: artistSpotifyId,
  };

  const { error: artistError } = await supabase
    .from("artists")
    .insert(artistInsert)
    .select("slug")
    .single();

  if (artistError) {
    throw new SupabaseDependencyError({
      message: `Failed to create artist: ${artistError.message}`,
      operation: "insert",
      resource: "artists",
      cause: artistError,
    });
  }

  return slug;
}
