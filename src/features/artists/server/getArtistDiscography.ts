import { createClient } from "@/server/supabase/server";
import { startSpan } from "@/monitoring/startSpan";
import { SupabaseDependencyError } from "@/server/supabase/SupabaseDependencyError";
import { parseAlbumImages } from "@/server/database/mappers/parseAlbumImages";
import type { Json } from "@/server/database";
import type { AlbumSummaryDTO } from "@/shared/types";
import type { ArtistDiscography } from "@/features/artists/types";

interface DiscographyAlbumRecord {
  id: string;
  images: Json;
  release_year: number | null;
  slug: string;
  title: string;
  tracklist: Json;
}

interface DiscographyAlbumArtistRecord {
  position: number;
  // Supabase returns the many-to-one side of a foreign key as an object, not an array.
  albums: DiscographyAlbumRecord | null;
}

interface ArtistDiscographyRecord {
  album_artists: DiscographyAlbumArtistRecord[] | null;
  id: string;
  images: Json;
  name: string;
  slug: string;
}

/**
 * Maps an album row to a lightweight album summary for list displays.
 */
function mapAlbumToAlbumSummaryDTO(
  album: DiscographyAlbumRecord,
  artistName: string,
): AlbumSummaryDTO {
  const images = parseAlbumImages(album.images);
  const tracklist = Array.isArray(album.tracklist) ? album.tracklist : [];

  return {
    id: album.id,
    name: album.title,
    artistName,
    imageUrl: images[0]?.url ?? null,
    images,
    releaseDate: album.release_year ? `${album.release_year}-01-01` : "",
    totalTracks: tracklist.length,
    label: "",
  };
}

/**
 * Returns the artist's profile and their full list of albums based on the provided slug.
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
            album_artists (
              position,
              albums (
                id,
                images,
                release_year,
                slug,
                title,
                tracklist
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

      // Sort the albums by release year and preserve credit order as the tiebreaker.
      const albums = (artist.album_artists ?? [])
        .map((albumArtist) => {
          return {
            album: albumArtist.albums,
            position: albumArtist.position,
          };
        })
        .filter(
          (
            albumArtist,
          ): albumArtist is {
            album: DiscographyAlbumRecord;
            position: number;
          } => albumArtist.album !== null,
        )
        .sort((a, b) => {
          if (a.album.release_year === null && b.album.release_year === null) {
            return a.position - b.position;
          }

          if (a.album.release_year === null) {
            return 1;
          }

          if (b.album.release_year === null) {
            return -1;
          }

          if (b.album.release_year !== a.album.release_year) {
            return b.album.release_year - a.album.release_year;
          }

          return a.position - b.position;
        });

      return {
        name: artist.name,
        imageUrl,
        slug: artist.slug,
        albums: albums.map((albumArtist) =>
          mapAlbumToAlbumSummaryDTO(albumArtist.album, artist.name),
        ),
      };
    },
  );
}
