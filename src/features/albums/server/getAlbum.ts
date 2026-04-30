import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import type { Json } from "@/server/database";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import type { AlbumRecord } from "@/shared/types";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";

interface ReleaseGroupArtistRecord {
  id: string;
  name: string;
  slug: string;
}

interface ReleaseGroupAlbumRecord {
  id: string;
  images: Json;
  title: string;
  tracklist: Json;
}

interface ReleaseGroupRecordData {
  albums: ReleaseGroupAlbumRecord[] | null;
  artists: ReleaseGroupArtistRecord | null;
  id: string;
  slug: string;
  title: string;
}

/**
 * Checks whether a child album has a usable tracklist payload.
 */
function hasTracklistEntries(album: ReleaseGroupAlbumRecord): boolean {
  return Array.isArray(album.tracklist) && album.tracklist.length > 0;
}

/**
 * Checks whether a child album has a usable image payload.
 */
function hasImageEntries(album: ReleaseGroupAlbumRecord): boolean {
  return Array.isArray(album.images) && album.images.length > 0;
}

/**
 * Picks the child album that should supply cover art and tracks for the page.
 */
function selectRepresentativeAlbum(
  albums: ReleaseGroupAlbumRecord[],
): ReleaseGroupAlbumRecord | undefined {
  const withTracks = albums.find((album) => hasTracklistEntries(album));

  if (withTracks) {
    return withTracks;
  }

  const withImages = albums.find((album) => hasImageEntries(album));

  if (withImages) {
    return withImages;
  }

  return albums[0];
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
            artists (
              id,
              name,
              slug
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
      const selectedAlbum = selectRepresentativeAlbum(albums);

      return mapAlbumRowToAlbum({
        // TODO: Replace this single-artist bridge once the live schema uses
        // release_group_artists and can return ordered artist credits here.
        artists: releaseGroup.artists ? [releaseGroup.artists] : [],
        id: releaseGroup.id,
        images: selectedAlbum?.images ?? [],
        slug: releaseGroup.slug,
        title: releaseGroup.title,
        tracklist: selectedAlbum?.tracklist ?? [],
      });
    },
  );
}
