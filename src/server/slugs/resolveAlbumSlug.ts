import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";

/**
 * Finds the album record that matches a public album slug.
 */
export async function resolveAlbumSlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Tables<"albums"> | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new SupabaseDependencyError({
      cause: error,
      code: error.code ?? undefined,
      message: `supabase.album_slug.resolve failed: ${error.message}`,
      operation: "supabase.album_slug.resolve",
      resource: "albums",
    });
  }

  if (!data) {
    return null;
  }

  return data;
}
