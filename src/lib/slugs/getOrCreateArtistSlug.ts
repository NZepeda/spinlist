import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/lib/types/database.types";
import { generateSlug } from "./generateSlug";
import { findAvailableSlug } from "./findAvailableSlug";
import { getArtist } from "../spotify/getArtist";

/**
 * Gets an existing slug or creates a new one for an artist.
 * Handles collisions by appending numbers (e.g., turnstile-2, turnstile-3).
 */
export async function getOrCreateArtistSlug(
  supabase: SupabaseClient<Database>,
  spotifyId: string,
): Promise<string> {
  // Check if slug already exists for this spotify_id
  const { data: slugRecord } = await supabase
    .from("artist_slugs")
    .select("slug")
    .eq("spotify_id", spotifyId)
    .single();

  if (slugRecord) {
    return slugRecord.slug;
  }

  const artist = await getArtist(spotifyId);

  // The record doesn't exist yet - upsert artist first
  const { data: artistRecord, error: artistError } = await supabase
    .from("artists")
    .upsert(
      {
        spotify_id: spotifyId,
        name: artist.name,
        last_synced_at: new Date().toISOString(),
        image_url: artist.image,
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
    spotify_id: spotifyId,
    artist_id: artistRecord.id,
  });

  if (insertError) {
    throw insertError;
  }

  return slug;
}
