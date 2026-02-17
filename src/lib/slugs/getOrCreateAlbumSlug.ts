import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/lib/types/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getSpotifyAlbum } from "../spotify/getSpotifyAlbum";

/**
 * Gets an existing slug or creates a new one for an album.
 * The slug is stored directly in the albums table.
 *
 * @param supabase - The Supabase client instance
 * @param spotifyId - The Spotify ID of the album
 * @returns The album's slug
 */
export async function getOrCreateAlbumSlug(
  supabase: SupabaseClient<Database>,
  spotifyId: string,
): Promise<string> {
  // Check if album already exists with a slug
  const { data: existing } = await supabase
    .from("albums")
    .select("slug")
    .eq("spotify_id", spotifyId)
    .single();

  if (existing) {
    return existing.slug;
  }

  const spotifyAlbum = await getSpotifyAlbum(spotifyId);

  if (!spotifyAlbum) {
    throw new Error("Album does not exist");
  }

  const albumImages = (spotifyAlbum.images || []) as unknown as Json;
  const tracks = spotifyAlbum.tracks.items.map(
    (track: {
      id: string;
      name: string;
      track_number: number;
      duration_ms: number;
    }) => ({
      id: track.id,
      name: track.name,
      track_number: track.track_number,
      duration_ms: track.duration_ms,
    }),
  );

  // Take the first artist
  const artist = spotifyAlbum.artists[0].name;

  // Generate slug with artist name for uniqueness (e.g., "radiohead-ok-computer")
  const baseSlug = generateSlug(`${artist}-${spotifyAlbum.name}`);
  const slug = await findAvailableSlug(supabase, "albums", baseSlug);
  const releaseDate =
    spotifyAlbum.release_date_precision === "year"
      ? // "en-CA" uses the YYYY-MM-DD format
        new Date(Number(spotifyAlbum.release_date), 1, 1).toLocaleDateString(
          "en-CA",
        )
      : spotifyAlbum.release_date;

  // Upsert album record with slug included
  const { error: albumError } = await supabase.from("albums").upsert(
    {
      spotify_id: spotifyAlbum.id,
      title: spotifyAlbum.name,
      artist,
      release_date: releaseDate,
      images: albumImages,
      last_synced_at: new Date().toISOString(),
      tracks,
      slug,
      label: spotifyAlbum.label,
    },
    { onConflict: "spotify_id" },
  );

  if (albumError) {
    throw new Error(`Failed to upsert album: ${albumError.message}`);
  }

  return slug;
}
