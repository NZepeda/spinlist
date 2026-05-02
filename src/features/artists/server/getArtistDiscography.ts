import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import { parseAlbumImages } from "@/server/database/mappers/parseAlbumImages";
import { selectRepresentativeAlbum } from "@/features/albums/utils/selectRepresentativeAlbum";
import type { Json } from "@/server/database";
import type { AlbumSummaryDTO } from "@/shared/types";
import type { ArtistDiscography } from "@/features/artists/types";

interface DiscographyAlbumRecord {
  id: string;
  images: Json;
  title: string;
  tracklist: Json;
}

interface DiscographyReleaseGroupRecord {
  id: string;
  title: string;
  slug: string;
  original_release_year: number | null;
  albums: DiscographyAlbumRecord[] | null;
}

interface DiscographyReleaseGroupArtistRecord {
  position: number;
  // Supabase returns the many-to-one side of a foreign key as an object, not an array.
  release_groups: DiscographyReleaseGroupRecord | null;
}

interface ArtistDiscographyRecord {
  id: string;
  name: string;
  slug: string;
  images: Json;
  release_group_artists: DiscographyReleaseGroupArtistRecord[] | null;
}

/**
 * Maps a release group row to a lightweight album summary for list displays.
 */
function mapReleaseGroupToAlbumSummaryDTO(
  releaseGroup: DiscographyReleaseGroupRecord,
  artistName: string,
): AlbumSummaryDTO {
  const albums = releaseGroup.albums ?? [];
  const representative = selectRepresentativeAlbum(albums);
  const images = parseAlbumImages(representative?.images ?? []);
  const tracklist = Array.isArray(representative?.tracklist)
    ? representative.tracklist
    : [];

  return {
    id: releaseGroup.id,
    name: releaseGroup.title,
    artistName,
    imageUrl: images[0]?.url ?? null,
    images,
    releaseDate: releaseGroup.original_release_year
      ? `${releaseGroup.original_release_year}-01-01`
      : "",
    totalTracks: tracklist.length,
    label: "",
  };
}

/**
 * Returns the artist's profile and their full list of release groups based on the provided slug.
 * Returns undefined when no artist matches the slug.
 */
export async function getArtistDiscography(
  slug: string,
): Promise<ArtistDiscography | undefined> {
  return await startSpan(
    {
      name: "page.artist.discography_load",
      op: "db.supabase",
    },
    async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("artists")
        .select(
          `
            id,
            name,
            slug,
            images,
            release_group_artists (
              position,
              release_groups (
                id,
                title,
                slug,
                original_release_year,
                albums (
                  id,
                  images,
                  title,
                  tracklist
                )
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
          message: `supabase.artist.discography_load failed: ${error.message}`,
          operation: "supabase.artist.discography_load",
          resource: "artists",
        });
      }

      const artist = data as ArtistDiscographyRecord | null;

      if (!artist) {
        return undefined;
      }

      const artistImages = parseAlbumImages(artist.images);
      const imageUrl = artistImages[0]?.url ?? null;

      // Sort the albums by release year.
      const releaseGroups = (artist.release_group_artists ?? [])
        .map((rga) => rga.release_groups)
        .filter((rg): rg is DiscographyReleaseGroupRecord => rg !== null)
        .sort((a, b) => {
          if (a.original_release_year === null) {
            return 1;
          }

          if (b.original_release_year === null) {
            return -1;
          }

          return b.original_release_year - a.original_release_year;
        });

      const albums = releaseGroups.map((rg) =>
        mapReleaseGroupToAlbumSummaryDTO(rg, artist.name),
      );

      return {
        name: artist.name,
        imageUrl,
        slug: artist.slug,
        albums,
      };
    },
  );
}
