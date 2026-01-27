import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/lib/supabase/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";

type ArtistData = Pick<TablesInsert<"artists">, "spotify_id" | "name">;

/**
 * Gets an existing slug or creates a new one for an artist.
 * Handles collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 * Handles race conditions via unique constraint + fallback query.
 *
 * @param supabase - The Supabase client instance
 * @param artist - The artist data including spotify_id and name
 * @returns The slug string for this artist
 *
 * @example
 * const slug = await getOrCreateArtistSlug(supabase, {
 *   spotify_id: "4Z8W4fKeB5YxbusRsdQVPb",
 *   name: "Turnstile"
 * });
 * // Returns "turnstile"
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  artist: ArtistData,
): Promise<string> {
  // Check if slug already exists for this spotify_id
  const { data: slugRecord } = await supabase
    .from("artist_slugs")
    .select("slug")
    .eq("spotify_id", artist.spotify_id)
    .single();

  if (slugRecord) {
    return slugRecord.slug;
  }

  // The record doesn't exist yet - upsert artist first
  const { data: artistRecord, error: artistError } = await supabase
    .from("artists")
    .upsert(
      {
        spotify_id: artist.spotify_id,
        name: artist.name,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "spotify_id" },
    )
    .select("id")
    .single();

  if (artistError || !artistRecord) {
    throw new Error(`Failed to upsert artist: ${artistError?.message}`);
  }

  // Generate base slug and find available variant
  const baseSlug = generateSlug(artist.name);
  const slug = await findAvailableSlug(supabase, "artist_slugs", baseSlug);

  const { error: insertError } = await supabase.from("artist_slugs").insert({
    slug,
    spotify_id: artist.spotify_id,
    artist_id: artistRecord.id,
  });

  if (insertError) {
    // Race condition: another request created the slug first
    // Fetch what they created
    const { data: raceResult } = await supabase
      .from("artist_slugs")
      .select("slug")
      .eq("spotify_id", artist.spotify_id)
      .single();

    if (raceResult) {
      return raceResult.slug;
    }
    throw insertError;
  }

  return slug;
}
