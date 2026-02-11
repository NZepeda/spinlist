import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "@/lib/types/database.types";

/**
 * Resolves an album slug to the full album record.
 * Returns null if the slug doesn't exist in the database.
 *
 * @param supabase - The Supabase client instance
 * @param slug - The album slug to resolve
 * @returns The full album record, or null if not found
 *
 * @example
 * const album = await resolveAlbumSlug(supabase, "turnstile-glow-on");
 * // Returns the full album record including id, spotify_id, title, etc.
 */
export async function resolveAlbumSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"albums"> | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
