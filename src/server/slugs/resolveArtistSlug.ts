import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Finds the artist record that matches a public artist slug.
 */
export async function resolveArtistSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"artists"> | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new SupabaseDependencyError({
      cause: error,
      code: error.code ?? undefined,
      message: `supabase.artist_slug.resolve failed: ${error.message}`,
      operation: "supabase.artist_slug.resolve",
      resource: "artists",
    });
  }

  if (!data) {
    return null;
  }

  return data;
}
