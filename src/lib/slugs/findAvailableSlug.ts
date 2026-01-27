import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";

/**
 * Finds an available slug by checking for collisions and appending numbers.
 * If "turnstile" is taken, tries "turnstile-2", "turnstile-3", etc.
 *
 * @param supabase - The Supabase client instance
 * @param table - The slug table to check ("artist_slugs" or "album_slugs")
 * @param baseSlug - The initial slug to check
 * @returns An available slug string
 *
 * @example
 * // If "turnstile" exists but "turnstile-2" doesn't:
 * const slug = await findAvailableSlug(supabase, "artist_slugs", "turnstile");
 * // Returns "turnstile-2"
 */
export async function findAvailableSlug(
  supabase: SupabaseClient<Database>,
  table: "artist_slugs" | "album_slugs",
  baseSlug: string,
): Promise<string> {
  // Get all slugs that start with this base slug
  const { data: conflicts } = await supabase
    .from(table)
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (!conflicts || conflicts.length === 0) {
    return baseSlug;
  }

  const slugs = new Set(conflicts.map((c) => c.slug));

  if (!slugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find the next available number
  let counter = 2;
  while (slugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}
