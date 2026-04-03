import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import { getSpotifyToken } from "./getSpotifyToken";
import type { SpotifyAlbumFull } from "@/server/spotify/types";

/**
 * Gets an album from Spotify
 */
export async function getSpotifyAlbum(
  id: string,
): Promise<SpotifyAlbumFull | undefined> {
  return await startSpan(
    {
      name: "spotify.album.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();

      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!albumResponse.ok) {
        if (albumResponse.status === 404) {
          return undefined;
        }

        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.album",
            resource: `albums/${id}`,
            status: albumResponse.status,
          },
          level: "error",
          message: "Spotify album request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to fetch album from Spotify API: ${albumResponse.status} ${albumResponse.statusText}`,
          operation: "spotify.album",
          resource: `albums/${id}`,
          status: albumResponse.status,
        });
      }

      return (await albumResponse.json()) as SpotifyAlbumFull;
    },
  );
}
