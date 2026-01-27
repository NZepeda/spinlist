import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "@/lib/supabase/database.types";

/**
 * Resolves an artist slug to a Spotify ID.
 * Returns null if the slug doesn't exist in the database.
 *
 * @param supabase - The Supabase client instance
 * @param slug - The artist slug to resolve
 * @returns The Spotify ID and slug, or null if not found
 *
 * @example
 * const result = await resolveArtistSlug(supabase, "turnstile");
 * // Returns { spotify_id: "4Z8W4fKeB5YxbusRsdQVPb", slug: "turnstile" }
 */
export async function resolveArtistSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"artist_slugs"> | null> {
  const { data, error } = await supabase
    .from("artist_slugs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
