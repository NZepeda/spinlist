import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import { getSpotifyToken } from "@/server/spotify/getSpotifyToken";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import { getSpotifyAlbum } from "@/server/spotify/getSpotifyAlbum";
import type {
  SpotifyAlbumFull,
  SpotifyAlbumSimplified,
} from "@/server/spotify/types";

interface SpotifyArtistAlbumsPage {
  items: SpotifyAlbumSimplified[];
  next: string | null;
}

/**
 * Loads one page of simplified album results for an artist from Spotify.
 *
 * @param accessToken - The Spotify access token used for the request.
 * @param artistId - The Spotify artist identifier.
 * @param url - The paginated Spotify URL to request.
 * @returns The next page of simplified artist albums.
 */
async function getArtistAlbumPage(args: {
  accessToken: string;
  artistId: string;
  url: string;
}): Promise<SpotifyArtistAlbumsPage> {
  const { accessToken, artistId, url } = args;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    addBreadcrumb({
      category: "spotify.request",
      data: {
        operation: "spotify.artist_album_page",
        resource: `artists/${artistId}/albums`,
        status: response.status,
      },
      level: "error",
      message: "Spotify artist albums page request failed",
    });

    throw new SpotifyDependencyError({
      message: `Failed to fetch artist albums from Spotify API: ${response.status} ${response.statusText}`,
      operation: "spotify.artist_album_page",
      resource: `artists/${artistId}/albums`,
      status: response.status,
    });
  }

  return (await response.json()) as SpotifyArtistAlbumsPage;
}

/**
 * Loads complete Spotify album records for an artist's album-only discography.
 *
 * @param artistId - The Spotify artist identifier.
 * @returns The full Spotify album payloads used by persistence workflows.
 */
export async function getArtistAlbumDetailsFromSpotify(
  artistId: string,
): Promise<SpotifyAlbumFull[]> {
  return await startSpan(
    {
      name: "spotify.artist_album_details.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();
      const albumIds = new Set<string>();
      let nextUrl:
        | string
        | null = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`;

      while (nextUrl !== null) {
        const page = await getArtistAlbumPage({
          accessToken,
          artistId,
          url: nextUrl,
        });

        for (const album of page.items) {
          if (album.album_type !== "album") {
            continue;
          }

          albumIds.add(album.id);
        }

        nextUrl = page.next;
      }

      const spotifyAlbums = await Promise.all(
        Array.from(albumIds).map(async (albumId) => {
          return await getSpotifyAlbum(albumId);
        }),
      );

      return spotifyAlbums.filter(
        (album): album is SpotifyAlbumFull => album !== undefined,
      );
    },
  );
}
