import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/lib/supabase/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { SpotifyImage, imagesToJson } from "@/lib/types/album";

/**
 * Data required to create an album slug.
 */
type AlbumData = Pick<
  TablesInsert<"albums">,
  "spotify_id" | "title" | "artist"
> & {
  release_date?: string;
  images?: SpotifyImage[];
};

/**
 * Gets an existing slug or creates a new one for an album.
 * Handles collisions by appending numbers (e.g., ok-computer-2).
 * Handles race conditions via unique constraint + fallback query.
 * Also upserts the album record with provided metadata.
 *
 * @param supabase - The Supabase client instance
 * @param album - The album data including spotify_id, title, artist, and optional release_date/images
 * @returns The slug string for this album
 *
 * @example
 * const slug = await getOrCreateAlbumSlug(supabase, {
 *   spotify_id: "6dVIqQ8qmQ5GBnJ9shOYGE",
 *   title: "Glow On",
 *   artist: "turnstile",
 *   release_date: "2021-08-27",
 *   images: [{ url: "https://...", width: 640, height: 640 }]
 * });
 * // Returns "turnstile-glow-on"
 */
export async function getOrCreateAlbumSlug(
  supabase: SupabaseClient<Database>,
  album: AlbumData,
): Promise<string> {
  // Check if slug already exists for this spotify_id
  const { data: existing } = await supabase
    .from("album_slugs")
    .select("slug")
    .eq("spotify_id", album.spotify_id)
    .single();

  if (existing) {
    return existing.slug;
  }

  // Upsert album record first (creates if not exists, updates if exists)
  const { data: albumRecord, error: albumError } = await supabase
    .from("albums")
    .upsert(
      {
        spotify_id: album.spotify_id,
        title: album.title,
        artist: album.artist,
        release_date: album.release_date,
        images: album.images ? imagesToJson(album.images) : undefined,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "spotify_id" },
    )
    .select("id")
    .single();

  if (albumError || !albumRecord) {
    throw new Error(`Failed to upsert album: ${albumError?.message}`);
  }

  // Generate slug with artist name for uniqueness (e.g., "radiohead-ok-computer")
  const baseSlug = generateSlug(`${album.artist}-${album.title}`);
  const slug = await findAvailableSlug(supabase, "album_slugs", baseSlug);

  // Try to insert the slug
  const { error: insertError } = await supabase.from("album_slugs").insert({
    slug,
    spotify_id: album.spotify_id,
    album_id: albumRecord.id,
  });

  if (insertError) {
    // Race condition: another request created the slug first
    // Fetch what they created
    const { data: raceResult } = await supabase
      .from("album_slugs")
      .select("slug")
      .eq("spotify_id", album.spotify_id)
      .single();

    if (raceResult) {
      return raceResult.slug;
    }
    throw insertError;
  }

  return slug;
}
