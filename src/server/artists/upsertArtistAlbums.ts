import { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlbumRow,
  ArtistRow,
  Database,
  Json,
  TablesInsert,
} from "@/server/database";
import { findAvailableSlug } from "@/server/slugs/findAvailableSlug";
import { generateSlug } from "@/server/slugs/generateSlug";
import { imagesToJson } from "@/server/spotify/imagesToJson";
import type { SpotifyAlbumFull } from "@/server/spotify/types";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import { getOrCreateCanonicalArtist } from "./getOrCreateCanonicalArtist";

/**
 * Maps a Spotify album type onto the normalized album type stored by the app.
 *
 * @param albumType - The Spotify album classification.
 * @returns The normalized stored album type.
 */
function mapSpotifyAlbumType(albumType: string): "album" | "ep" | "single" {
  if (albumType === "single") {
    return "single";
  }

  return "album";
}

/**
 * Extracts the original release year from a Spotify release-date string.
 *
 * @param releaseDate - The Spotify release date string.
 * @returns The four-digit release year when available.
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
 *
 * @param spotifyAlbum - The Spotify album payload to persist.
 * @returns The normalized JSON tracklist stored on the album row.
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
 * Builds the mutable album fields persisted from a Spotify album payload.
 *
 * @param spotifyAlbum - The Spotify album payload to persist.
 * @param slug - The canonical album slug to store.
 * @returns The album row fields used for insert and update operations.
 */
function buildAlbumRow(
  spotifyAlbum: SpotifyAlbumFull,
  slug: string,
): Pick<
  TablesInsert<"albums">,
  "images" | "release_year" | "slug" | "spotify_id" | "title" | "tracklist" | "type" | "upc"
> {
  return {
    images: imagesToJson(spotifyAlbum.images ?? []),
    release_year: getOriginalReleaseYear(spotifyAlbum.release_date),
    slug,
    spotify_id: spotifyAlbum.id,
    title: spotifyAlbum.name,
    tracklist: mapSpotifyTracklist(spotifyAlbum),
    type: mapSpotifyAlbumType(spotifyAlbum.album_type),
    upc: spotifyAlbum.external_ids?.upc ?? null,
  };
}

/**
 * Replaces the stored album credit order so it matches the latest Spotify payload.
 *
 * @param supabase - The Supabase client used for credit persistence.
 * @param albumId - The canonical album identifier.
 * @param artistIds - The canonical credited artists in display order.
 */
async function replaceAlbumArtists(
  supabase: SupabaseClient<Database>,
  albumId: string,
  artistIds: string[],
): Promise<void> {
  const { error: deleteAlbumArtistsError } = await supabase
    .from("album_artists")
    .delete()
    .eq("album_id", albumId);

  if (deleteAlbumArtistsError) {
    throw new SupabaseDependencyError({
      message: `Failed to replace album artists: ${deleteAlbumArtistsError.message}`,
      operation: "delete",
      resource: "album_artists",
      cause: deleteAlbumArtistsError,
    });
  }

  const albumArtistsInsert = artistIds.map((artistId, index) => {
    return {
      album_id: albumId,
      artist_id: artistId,
      position: index + 1,
    };
  });

  const { error: insertAlbumArtistsError } = await supabase
    .from("album_artists")
    .insert(albumArtistsInsert);

  if (insertAlbumArtistsError) {
    throw new SupabaseDependencyError({
      message: `Failed to store album artists: ${insertAlbumArtistsError.message}`,
      operation: "insert",
      resource: "album_artists",
      cause: insertAlbumArtistsError,
    });
  }
}

/**
 * Removes artist credits for albums that no longer belong in the latest synced discography.
 *
 * @param supabase - The Supabase client used for credit persistence.
 * @param artistId - The canonical artist whose discography is being synchronized.
 * @param syncedAlbumIds - The canonical albums that should remain attached to the artist.
 */
async function removeMissingArtistAlbumCredits(
  supabase: SupabaseClient<Database>,
  artistId: string,
  syncedAlbumIds: string[],
): Promise<void> {
  const { data: existingCredits, error: existingCreditsError } = await supabase
    .from("album_artists")
    .select("album_id")
    .eq("artist_id", artistId);

  if (existingCreditsError) {
    throw new SupabaseDependencyError({
      message: `Failed to inspect stale artist albums: ${existingCreditsError.message}`,
      operation: "select",
      resource: "album_artists",
      cause: existingCreditsError,
    });
  }

  const staleAlbumIds = existingCredits
    .map((credit) => credit.album_id)
    .filter((albumId) => !syncedAlbumIds.includes(albumId));

  if (staleAlbumIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("album_artists")
    .delete()
    .eq("artist_id", artistId)
    .in("album_id", staleAlbumIds);

  if (error) {
    throw new SupabaseDependencyError({
      message: `Failed to remove stale artist albums: ${error.message}`,
      operation: "delete",
      resource: "album_artists",
      cause: error,
    });
  }
}

/**
 * Inserts or updates a canonical album row from a Spotify album payload.
 *
 * @param supabase - The Supabase client used for album persistence.
 * @param spotifyAlbum - The Spotify album payload to persist.
 * @returns The stored album identifier.
 */
async function upsertAlbumRow(
  supabase: SupabaseClient<Database>,
  spotifyAlbum: SpotifyAlbumFull,
): Promise<Pick<AlbumRow, "id">> {
  const { data: existingAlbum, error: existingAlbumError } = await supabase
    .from("albums")
    .select("id, slug")
    .eq("spotify_id", spotifyAlbum.id)
    .maybeSingle();

  if (existingAlbumError) {
    throw new SupabaseDependencyError({
      message: `Failed to resolve album: ${existingAlbumError.message}`,
      operation: "select",
      resource: "albums",
      cause: existingAlbumError,
    });
  }

  if (existingAlbum !== null) {
    const albumUpdate = buildAlbumRow(spotifyAlbum, existingAlbum.slug);
    const { data: updatedAlbum, error: updatedAlbumError } = await supabase
      .from("albums")
      .update(albumUpdate)
      .eq("id", existingAlbum.id)
      .select("id")
      .single();

    if (updatedAlbumError) {
      throw new SupabaseDependencyError({
        message: `Failed to update album: ${updatedAlbumError.message}`,
        operation: "update",
        resource: "albums",
        cause: updatedAlbumError,
      });
    }

    return updatedAlbum;
  }

  const primaryArtistName = spotifyAlbum.artists[0]?.name ?? "unknown-artist";
  const baseSlug = generateSlug(`${primaryArtistName}-${spotifyAlbum.name}`);
  const slug = await findAvailableSlug(supabase, "albums", baseSlug);
  const albumInsert = buildAlbumRow(spotifyAlbum, slug);

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

  return insertedAlbum;
}

/**
 * Persists a full set of album-only Spotify results for a canonical artist.
 *
 * @param supabase - The Supabase client used for album and credit persistence.
 * @param spotifyAlbums - The Spotify album payloads that should exist locally.
 */
export async function upsertArtistAlbums(
  supabase: SupabaseClient<Database>,
  artistId: string,
  spotifyAlbums: SpotifyAlbumFull[],
): Promise<void> {
  const syncedAlbumIds: string[] = [];

  for (const spotifyAlbum of spotifyAlbums) {
    const canonicalArtists: Array<Pick<ArtistRow, "id" | "name" | "slug">> =
      [];

    for (const artist of spotifyAlbum.artists) {
      const canonicalArtist = await getOrCreateCanonicalArtist(supabase, artist);

      canonicalArtists.push(canonicalArtist);
    }

    const storedAlbum = await upsertAlbumRow(supabase, spotifyAlbum);
    syncedAlbumIds.push(storedAlbum.id);

    // Replace credits as a full set so repeated syncs stay deterministic.
    await replaceAlbumArtists(
      supabase,
      storedAlbum.id,
      canonicalArtists.map((artist) => artist.id),
    );
  }

  await removeMissingArtistAlbumCredits(supabase, artistId, syncedAlbumIds);
}
