import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import type { Json } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import type { AlbumRecord } from "@/shared/types";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";
import { selectRepresentativeAlbum } from "@/features/albums/utils/selectRepresentativeAlbum";

interface ReleaseGroupArtistRecord {
  artists: {
    id: string;
    name: string;
    slug: string;
  } | null;
  position: number;
}

interface ReleaseGroupAlbumRecord {
  id: string;
  images: Json;
  title: string;
  tracklist: Json;
}

interface ReleaseGroupRecordData {
  albums: ReleaseGroupAlbumRecord[] | null;
  id: string;
  release_group_artists: ReleaseGroupArtistRecord[] | null;
  slug: string;
  title: string;
}

/**
 * Orders and unwraps release-group artist credits for page rendering.
 */
function mapOrderedArtistCredits(
  artistCredits: ReleaseGroupArtistRecord[] | null,
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
 * The album is retrieved by matching the slug to a release group, then selecting a representative child album for tracks and cover art, and finally mapping the assembled data into the shared album model.
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
        .from("release_groups")
        .select(
          `
            id,
            slug,
            title,
            release_group_artists (
              position,
              artists (
                id,
                name,
                slug
              )
            ),
            albums (
              id,
              images,
              title,
              tracklist
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
          resource: "release_groups",
        });
      }

      const releaseGroup = data as ReleaseGroupRecordData | null;

      if (!releaseGroup) {
        return undefined;
      }

      const albums = releaseGroup.albums ?? [];
      const artists = mapOrderedArtistCredits(
        releaseGroup.release_group_artists,
      );
      const selectedAlbum = selectRepresentativeAlbum(albums);

      return mapAlbumRowToAlbum({
        artists,
        id: releaseGroup.id,
        images: selectedAlbum?.images ?? [],
        slug: releaseGroup.slug,
        title: releaseGroup.title,
        tracklist: selectedAlbum?.tracklist ?? [],
      });
    },
  );
}
