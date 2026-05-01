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
import type { SpotifyArtistSimplified } from "../spotify/types";

/**
 * Resolves an existing canonical artist or creates one for a Spotify artist.
 */
async function getOrCreateCanonicalArtist(
  supabase: SupabaseClient<Database>,
  artist: SpotifyArtistSimplified,
): Promise<Pick<ArtistRow, "id" | "name">> {
  const { data: existingArtistMapping, error: existingArtistMappingError } =
    await supabase
      .from("mappings")
      .select("artist_id, artists(id, name)")
      .eq("provider_name", "spotify")
      .eq("provider_id", artist.id)
      .not("artist_id", "is", null)
      .maybeSingle();

  if (existingArtistMappingError) {
    throw new Error(
      `Failed to resolve artist mapping: ${existingArtistMappingError.message}`,
    );
  }

  const existingArtist = existingArtistMapping?.artists;

  if (
    existingArtist &&
    !Array.isArray(existingArtist) &&
    typeof existingArtist.id === "string" &&
    typeof existingArtist.name === "string"
  ) {
    return {
      id: existingArtist.id,
      name: existingArtist.name,
    };
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
  };

  const { data: insertedArtist, error: insertedArtistError } = await supabase
    .from("artists")
    .insert(artistInsert)
    .select("id, name")
    .single();

  if (insertedArtistError) {
    throw new Error(`Failed to create artist: ${insertedArtistError.message}`);
  }

  const { error: insertedArtistMappingError } = await supabase
    .from("mappings")
    .insert({
      artist_id: insertedArtist.id,
      provider_id: artist.id,
      provider_name: "spotify",
    });

  if (insertedArtistMappingError) {
    throw new Error(
      `Failed to create artist mapping: ${insertedArtistMappingError.message}`,
    );
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
 * Gets an existing slug or creates a new one for an album.
 * The slug is stored on the canonical release group for the album.
 *
 * @param supabase - The Supabase client instance
 * @param spotifyId - The Spotify ID of the album
 * @returns The album's slug
 */
export async function getOrCreateAlbumSlug(
  supabase: SupabaseClient<Database>,
  spotifyId: string,
): Promise<string> {
  // Join the mappings table with the release_groups table to check for an existing slug for the given Spotify ID
  const { data: existing } = await supabase
    .from("mappings")
    .select("release_groups(slug)")
    .eq("provider_name", "spotify")
    .eq("provider_id", spotifyId)
    .not("release_group_id", "is", null)
    .single();

  if (existing && existing.release_groups) {
    return existing.release_groups.slug;
  }

  // We don't have a slug for this Spotify Id, so we need to create one. First, fetch the album details from Spotify to generate a slug.
  const spotifyAlbum = await getSpotifyAlbum(spotifyId);

  if (!spotifyAlbum) {
    throw new Error("Album does not exist");
  }

  const albumImages = (spotifyAlbum.images || []) as unknown as Json;
  const tracks = spotifyAlbum.tracks.items.map((track) => {
    return {
      duration_ms: track.duration_ms,
      id: track.id,
      name: track.name,
      track_number: track.track_number,
    };
  });
  const primaryArtistName = spotifyAlbum.artists[0]?.name ?? "unknown-artist";
  const canonicalArtists: Array<Pick<ArtistRow, "id" | "name">> = [];

  for (const [index, artist] of spotifyAlbum.artists.entries()) {
    const canonicalArtist = await getOrCreateCanonicalArtist(supabase, artist);

    canonicalArtists[index] = canonicalArtist;
  }

  // Generate slug with artist name for uniqueness (e.g., "radiohead-ok-computer")
  const baseSlug = generateSlug(`${primaryArtistName}-${spotifyAlbum.name}`);
  const slug = await findAvailableSlug(supabase, "release_groups", baseSlug);

  // Insert the release group record.
  const { data: releaseGroup, error: releaseGroupError } = await supabase
    .from("release_groups")
    .insert({
      // We don't have MusicBrainz data at this point, so mbid and original_release_year are null. They'll be backfilled later by a background job.
      mb_group_id: null,
      original_release_year: getOriginalReleaseYear(spotifyAlbum.release_date),
      slug,
      title: spotifyAlbum.name,
      type: mapSpotifyAlbumType(spotifyAlbum.album_type),
    })
    .select("id")
    .single();

  if (releaseGroupError) {
    throw new Error(
      `Failed to create release group: ${releaseGroupError.message}`,
    );
  }

  const releaseGroupArtistRows = canonicalArtists.map((artist, index) => {
    return {
      artist_id: artist.id,
      position: index + 1,
      release_group_id: releaseGroup.id,
    };
  });

  // Insert the release group artists.
  const { error: releaseGroupArtistsError } = await supabase
    .from("release_group_artists")
    .insert(releaseGroupArtistRows);

  if (releaseGroupArtistsError) {
    throw new Error(
      `Failed to create release group artists: ${releaseGroupArtistsError.message}`,
    );
  }

  // Insert the album record.
  const { error: albumError } = await supabase.from("albums").insert({
    release_group_id: releaseGroup.id,
    title: spotifyAlbum.name,
    images: albumImages,
    tracklist: tracks as unknown as Json,
  });

  if (albumError) {
    throw new Error(`Failed to create album: ${albumError.message}`);
  }

  // Insert the mapping record to link the Spotify album ID to our release group.
  const { error: mappingError } = await supabase.from("mappings").insert({
    provider_id: spotifyAlbum.id,
    provider_name: "spotify",
    release_group_id: releaseGroup.id,
    upc: spotifyAlbum.external_ids?.upc ?? null,
  });

  if (mappingError) {
    throw new Error(`Failed to create album mapping: ${mappingError.message}`);
  }

  return slug;
}
