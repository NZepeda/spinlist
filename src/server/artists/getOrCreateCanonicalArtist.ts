import { SupabaseClient } from "@supabase/supabase-js";
import type { ArtistRow, Database, TablesInsert } from "@/server/database";
import { findAvailableSlug } from "@/server/slugs/findAvailableSlug";
import { generateSlug } from "@/server/slugs/generateSlug";
import { getSpotifyArtist } from "@/server/spotify/getSpotifyArtist";
import { imagesToJson } from "@/server/spotify/imagesToJson";
import type { SpotifyArtistSimplified } from "@/server/spotify/types";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Resolves an existing canonical artist or creates one from Spotify metadata.
 *
 * @param supabase - The Supabase client used for artist persistence.
 * @param artist - The Spotify artist payload associated with the album credit.
 * @returns The canonical stored artist identity used by normalized album credits.
 */
export async function getOrCreateCanonicalArtist(
  supabase: SupabaseClient<Database>,
  artist: SpotifyArtistSimplified,
): Promise<Pick<ArtistRow, "id" | "name" | "slug">> {
  const { data: existingArtist, error: existingArtistError } = await supabase
    .from("artists")
    .select("id, name, slug")
    .eq("spotify_id", artist.id)
    .maybeSingle();

  if (existingArtistError) {
    throw new SupabaseDependencyError({
      message: `Failed to resolve artist: ${existingArtistError.message}`,
      operation: "select",
      resource: "artists",
      cause: existingArtistError,
    });
  }

  if (existingArtist !== null) {
    return existingArtist;
  }

  const artistSlug = await findAvailableSlug(
    supabase,
    "artists",
    generateSlug(artist.name),
  );
  const spotifyArtist = await getSpotifyArtist(artist.id);
  const artistInsert: TablesInsert<"artists"> = {
    images: imagesToJson(spotifyArtist?.images ?? []),
    name: artist.name,
    slug: artistSlug,
    spotify_id: artist.id,
  };

  const { data: insertedArtist, error: insertedArtistError } = await supabase
    .from("artists")
    .insert(artistInsert)
    .select("id, name, slug")
    .single();

  if (insertedArtistError) {
    throw new SupabaseDependencyError({
      message: `Failed to create artist: ${insertedArtistError.message}`,
      operation: "insert",
      resource: "artists",
      cause: insertedArtistError,
    });
  }

  return insertedArtist;
}
