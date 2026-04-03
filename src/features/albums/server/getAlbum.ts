import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import { resolveAlbumSlug } from "@/server/slugs/resolveAlbumSlug";
import type { Album } from "@/shared/types";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";

/**
 * Loads the canonical album record for a public album slug.
 */
export async function getAlbum(slug: string): Promise<Album | undefined> {
  return await startSpan(
    {
      name: "page.album.record_load",
      op: "db.supabase",
    },
    async () => {
      const supabase = await createClient();

      const album = await resolveAlbumSlug(supabase, slug);

      if (!album) {
        return undefined;
      }

      return mapAlbumRowToAlbum(album);
    },
  );
}
