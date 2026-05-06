import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";
import { imagesToJson } from "@/server/spotify/imagesToJson";
import { getArtistAlbumDetailsFromSpotify } from "@/server/spotify/getArtistAlbumDetailsFromSpotify";
import { getSpotifyArtist } from "@/server/spotify/getSpotifyArtist";
import type { SpotifyArtistFull } from "@/server/spotify/types";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import { markArtistDiscographySynced } from "./markArtistDiscographySynced";
import { upsertArtistAlbums } from "./upsertArtistAlbums";

/**
 * Stores the latest Spotify profile fields for a canonical artist.
 *
 * @param supabase - The Supabase client used for artist persistence.
 * @param artistId - The canonical artist identifier.
 * @param spotifyArtist - The latest Spotify artist payload.
 */
async function updateArtistProfile(args: {
  artistId: string;
  spotifyArtist: SpotifyArtistFull;
  supabase: SupabaseClient<Database>;
}): Promise<void> {
  const { artistId, spotifyArtist, supabase } = args;
  const { error } = await supabase
    .from("artists")
    .update({
      images: imagesToJson(spotifyArtist.images ?? []),
      name: spotifyArtist.name,
    })
    .eq("id", artistId);

  if (error) {
    throw new SupabaseDependencyError({
      message: `Failed to update artist profile: ${error.message}`,
      operation: "update",
      resource: "artists",
      cause: error,
    });
  }
}

/**
 * Synchronizes an artist profile and album-only discography from Spotify into the database.
 *
 * @param args - The canonical artist identity and optional preloaded Spotify artist payload.
 */
export async function syncArtistDiscography(args: {
  artistId: string;
  artistSpotifyId: string;
  spotifyArtist?: SpotifyArtistFull;
  supabase: SupabaseClient<Database>;
}): Promise<void> {
  const { artistId, artistSpotifyId, spotifyArtist, supabase } = args;
  const resolvedSpotifyArtist =
    spotifyArtist ?? (await getSpotifyArtist(artistSpotifyId));

  if (!resolvedSpotifyArtist) {
    throw new Error(`Artist not found on Spotify: ${artistSpotifyId}`);
  }

  await updateArtistProfile({
    artistId,
    spotifyArtist: resolvedSpotifyArtist,
    supabase,
  });

  const spotifyAlbums = await getArtistAlbumDetailsFromSpotify(artistSpotifyId);

  await upsertArtistAlbums(supabase, artistId, spotifyAlbums);
  await markArtistDiscographySynced(
    supabase,
    artistId,
    new Date().toISOString(),
  );
}
