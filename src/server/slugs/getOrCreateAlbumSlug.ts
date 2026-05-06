import { SupabaseClient } from "@supabase/supabase-js";
import type {
  ArtistRow,
  Database,
  Json,
  TablesInsert,
} from "@/server/database";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getSpotifyAlbum } from "../spotify/getSpotifyAlbum";
import { getSpotifyArtist } from "../spotify/getSpotifyArtist";
import { imagesToJson } from "../spotify/imagesToJson";
import type {
  SpotifyAlbumFull,
  SpotifyArtistSimplified,
} from "../spotify/types";
import { SupabaseDependencyError } from "../supabase/SupabaseDependencyError";

/**
 * Resolves an existing canonical artist or creates one for a Spotify artist.
 */
async function getOrCreateCanonicalArtist(
  supabase: SupabaseClient<Database>,
  artist: SpotifyArtistSimplified,
): Promise<Pick<ArtistRow, "id" | "name">> {
  const { data: existingArtist, error: existingArtistError } = await supabase
    .from("artists")
    .select("id, name")
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
    .select("id, name")
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

/**
 * Maps a Spotify album type onto the normalized release-group type values.
 */
function mapSpotifyAlbumType(albumType: string): "album" | "ep" | "single" {
  if (albumType === "single") {
    return "single";
  }

  return "album";
}

/**
 * Extracts the original release year from a Spotify release-date string.
 */
function getOriginalReleaseYear(releaseDate: string): number | null {
  const releaseYear = Number.parseInt(releaseDate.slice(0, 4), 10);

  if (Number.isNaN(releaseYear)) {
    return null;
  }

  return releaseYear;
}

/**
 * Converts Spotify track data into the stored album tracklist shape.
 */
function mapSpotifyTracklist(spotifyAlbum: SpotifyAlbumFull): Json {
  return spotifyAlbum.tracks.items.map((track) => {
    return {
      duration_ms: track.duration_ms,
      id: track.id,
      name: track.name,
      track_number: track.track_number,
    };
  }) as Json;
}

/**
 * Gets an existing slug or creates a new one for an album.
 * The slug is stored directly on the album record.
 *
 * @param supabase - The Supabase client instance
 * @param spotifyId - The Spotify ID of the album
 * @returns The album's slug
 */
export async function getOrCreateAlbumSlug(
  supabase: SupabaseClient<Database>,
  spotifyId: string,
): Promise<string> {
  // The updated schema stores the Spotify identifier directly on the album row.
  const { data: existingAlbum, error: existingAlbumError } = await supabase
    .from("albums")
    .select("slug")
    .eq("spotify_id", spotifyId)
    .maybeSingle();

  if (existingAlbumError) {
    throw new SupabaseDependencyError({
      message: `Failed to query existing album: ${existingAlbumError.message}`,
      operation: "select",
      resource: "albums",
      cause: existingAlbumError,
    });
  }

  if (existingAlbum !== null) {
    return existingAlbum.slug;
  }

  // We don't have a slug for this Spotify Id, so we need to create one. First, fetch the album details from Spotify to generate a slug.
  const spotifyAlbum = await getSpotifyAlbum(spotifyId);

  if (!spotifyAlbum) {
    throw new Error("Album does not exist");
  }

  const albumImages = imagesToJson(spotifyAlbum.images ?? []);
  const tracks = mapSpotifyTracklist(spotifyAlbum);
  const primaryArtistName = spotifyAlbum.artists[0]?.name ?? "unknown-artist";
  const canonicalArtists: Array<Pick<ArtistRow, "id" | "name">> = [];

  for (const [index, artist] of spotifyAlbum.artists.entries()) {
    const canonicalArtist = await getOrCreateCanonicalArtist(supabase, artist);

    canonicalArtists[index] = canonicalArtist;
  }

  // Generate slug with artist name for uniqueness (e.g., "radiohead-ok-computer")
  const baseSlug = generateSlug(`${primaryArtistName}-${spotifyAlbum.name}`);
  const slug = await findAvailableSlug(supabase, "albums", baseSlug);
  const albumInsert: TablesInsert<"albums"> = {
    images: albumImages,
    release_year: getOriginalReleaseYear(spotifyAlbum.release_date),
    slug,
    spotify_id: spotifyAlbum.id,
    title: spotifyAlbum.name,
    tracklist: tracks,
    type: mapSpotifyAlbumType(spotifyAlbum.album_type),
    upc: spotifyAlbum.external_ids?.upc ?? null,
  };

  const { data: insertedAlbum, error: insertedAlbumError } = await supabase
    .from("albums")
    .insert(albumInsert)
    .select("id")
    .single();

  if (insertedAlbumError) {
    throw new SupabaseDependencyError({
      message: `Failed to create album: ${insertedAlbumError.message}`,
      operation: "insert",
      resource: "albums",
      cause: insertedAlbumError,
    });
  }

  const albumArtistRows = canonicalArtists.map((artist, index) => {
    return {
      album_id: insertedAlbum.id,
      artist_id: artist.id,
      position: index + 1,
    };
  });

  const { error: albumArtistsError } = await supabase
    .from("album_artists")
    .insert(albumArtistRows);

  if (albumArtistsError) {
    throw new SupabaseDependencyError({
      message: `Failed to create album artists: ${albumArtistsError.message}`,
      operation: "insert",
      resource: "album_artists",
      cause: albumArtistsError,
    });
  }

  return slug;
}
