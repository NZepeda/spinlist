import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import { getSpotifyToken } from "./getSpotifyToken";
import type { SpotifyArtistFull } from "@/server/spotify/types";

/**
 * Gets an artist payload from Spotify.
 */
export async function getSpotifyArtist(
  id: string,
): Promise<SpotifyArtistFull | undefined> {
  return await startSpan(
    {
      name: "spotify.artist.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();

      const artistResponse = await fetch(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!artistResponse.ok) {
        if (artistResponse.status === 404) {
          return undefined;
        }

        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.artist",
            resource: `artists/${id}`,
            status: artistResponse.status,
          },
          level: "error",
          message: "Spotify artist request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to fetch artist from Spotify API: ${artistResponse.status} ${artistResponse.statusText}`,
          operation: "spotify.artist",
          resource: `artists/${id}`,
          status: artistResponse.status,
        });
      }

      return (await artistResponse.json()) as SpotifyArtistFull;
    },
  );
}
