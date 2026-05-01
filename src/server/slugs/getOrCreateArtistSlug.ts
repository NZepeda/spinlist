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
 * When the artist is new, fetches details from Spotify and creates records in both the artists and mappings tables before returning the slug.
 * Handles slug collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  artistSpotifyId: string,
): Promise<string> {
  // Join the mappings table with the artists table to check for an existing slug for the given artist Spotify ID.
  const { data: existing, error: existingError } = await supabase
    .from("mappings")
    .select("artists(slug)")
    .eq("provider_name", "spotify")
    .eq("provider_id", artistSpotifyId)
    .not("artist_id", "is", null)
    .maybeSingle();

  if (existingError) {
    throw new SupabaseDependencyError({
      message: `Failed to query existing artist mapping: ${existingError.message}`,
      operation: "select",
      resource: "mappings/artists",
      cause: existingError,
    });
  }

  if (existing?.artists && !Array.isArray(existing.artists)) {
    return existing.artists.slug;
  }

  // The artist doesn't exist in the database yet.
  // Fetch from Spotify to get the name and images needed to create canonical records.
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
  };

  const { data: insertedArtist, error: artistError } = await supabase
    .from("artists")
    .insert(artistInsert)
    .select("id")
    .single();

  if (artistError) {
    throw new SupabaseDependencyError({
      message: `Failed to create artist: ${artistError.message}`,
      operation: "insert",
      resource: "artists",
      cause: artistError,
    });
  }

  const { error: mappingError } = await supabase.from("mappings").insert({
    artist_id: insertedArtist.id,
    provider_id: artistSpotifyId,
    provider_name: "spotify",
  });

  if (mappingError) {
    throw new SupabaseDependencyError({
      message: `Failed to create artist mapping: ${mappingError.message}`,
      operation: "insert",
      resource: "mappings",
      cause: mappingError,
    });
  }

  return slug;
}
