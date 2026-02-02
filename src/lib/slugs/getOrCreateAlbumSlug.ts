import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/lib/types/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getSpotifyAlbum } from "../spotify/getSpotifyAlbum";
import { imagesToJson } from "../spotify/imagesToJson";

/**
 * Gets an existing slug or creates a new one for an album.
 */
export async function getOrCreateAlbumSlug(
  supabase: SupabaseClient<Database>,
  spotifyId: string,
): Promise<string> {
  // Check if slug already exists for this spotify_id
  const { data: existing } = await supabase
    .from("album_slugs")
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

  // Upsert album record first (creates if not exists, updates if exists)
  const { data: albumRecord, error: albumError } = await supabase
    .from("albums")
    .upsert(
      {
        spotify_id: spotifyAlbum.id,
        title: spotifyAlbum.name,
        artist,
        release_date: spotifyAlbum.release_date,
        images: albumImages,
        last_synced_at: new Date().toISOString(),
        tracks,
      },
      { onConflict: "spotify_id" },
    )
    .select("id")
    .single();

  if (albumError || !albumRecord) {
    throw new Error(`Failed to upsert album: ${albumError?.message}`);
  }

  // Generate slug with artist name for uniqueness (e.g., "radiohead-ok-computer")
  const baseSlug = generateSlug(`${artist}-${spotifyAlbum.name}`);
  const slug = await findAvailableSlug(supabase, "album_slugs", baseSlug);

  // Insert the slug
  const { error: insertError } = await supabase.from("album_slugs").insert({
    slug,
    spotify_id: spotifyAlbum.id,
    album_id: albumRecord.id,
  });

  if (insertError) {
    throw insertError;
  }

  return slug;
}
