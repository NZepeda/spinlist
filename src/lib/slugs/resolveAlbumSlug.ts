import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "@/lib/types/database.types";

/**
 * Resolves an album slug to a Spotify ID.
 * Returns null if the slug doesn't exist in the database.
 *
 * @param supabase - The Supabase client instance
 * @param slug - The album slug to resolve
 * @returns The Spotify ID and slug, or null if not found
 *
 * @example
 * const result = await resolveAlbumSlug(supabase, "turnstile-glow-on");
 * // Returns { spotify_id: "6dVIqQ8qmQ5GBnJ9shOYGE", slug: "turnstile-glow-on" }
 */
export async function resolveAlbumSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"album_slugs"> | null> {
  const { data, error } = await supabase
    .from("album_slugs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
