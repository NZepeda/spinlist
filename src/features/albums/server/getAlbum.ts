import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import type { Json } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import type { AlbumRecord } from "@/shared/types";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";

interface AlbumArtistRecord {
  artists: {
    id: string;
    name: string;
    slug: string;
  } | null;
  position: number;
}

interface AlbumRecordData {
  album_artists: AlbumArtistRecord[] | null;
  id: string;
  images: Json;
  slug: string;
  title: string;
  tracklist: Json;
}

/**
 * Orders and unwraps album artist credits for page rendering.
 */
function mapOrderedArtistCredits(
  artistCredits: AlbumArtistRecord[] | null,
): Array<{ id: string; name: string; slug: string }> {
  return (artistCredits ?? [])
    .filter((artistCredit) => artistCredit.artists !== null)
    .sort((left, right) => left.position - right.position)
    .map((artistCredit) => {
      return artistCredit.artists as { id: string; name: string; slug: string };
    });
}

/**
 * Loads the canonical album record for a public album slug.
 * The album is retrieved directly from the albums table with its ordered artist credits and then mapped into the shared album model.
 */
export async function getAlbum(
  slug: string,
): Promise<AlbumRecord | undefined> {
  return await startSpan(
    {
      name: "page.album.record_load",
      op: "db.supabase",
    },
    async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("albums")
        .select(
          `
            id,
            slug,
            title,
            images,
            tracklist,
            album_artists (
              position,
              artists (
                id,
                name,
                slug
              )
            )
          `,
        )
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw new SupabaseDependencyError({
          cause: error,
          code: error.code ?? undefined,
          message: `supabase.album.load failed: ${error.message}`,
          operation: "supabase.album.load",
          resource: "albums",
        });
      }

      const album = data as AlbumRecordData | null;

      if (!album) {
        return undefined;
      }

      const artists = mapOrderedArtistCredits(album.album_artists);

      return mapAlbumRowToAlbum({
        artists,
        id: album.id,
        images: album.images,
        slug: album.slug,
        title: album.title,
        tracklist: album.tracklist,
      });
    },
  );
}
