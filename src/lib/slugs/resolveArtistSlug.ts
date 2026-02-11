import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "@/lib/types/database.types";

/**
 * Resolves an artist slug to the full artist record.
 * Returns null if the slug doesn't exist in the database.
 *
 * @param supabase - The Supabase client instance
 * @param slug - The artist slug to resolve
 * @returns The full artist record, or null if not found
 *
 * @example
 * const artist = await resolveArtistSlug(supabase, "turnstile");
 * // Returns the full artist record including id, spotify_id, name, etc.
 */
export async function resolveArtistSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"artists"> | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
