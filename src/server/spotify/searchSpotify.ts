import { startSpan } from "@/monitoring/startSpan";
import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { getSpotifyToken } from "@/server/spotify/getSpotifyToken";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import type { SpotifySearchResponse } from "@/server/spotify/types";

/**
 * Centralizes Spotify search reads so discovery routes share the same tracing
 * behavior and upstream failures carry stable dependency metadata.
 *
 * @param query - The user search text forwarded to Spotify.
 * @returns The raw Spotify search response.
 */
export async function searchSpotify(
  query: string,
): Promise<SpotifySearchResponse> {
  return await startSpan(
    {
      name: "spotify.search.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query,
      )}&type=artist,album&limit=5`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!searchResponse.ok) {
        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.search",
            resource: "search",
            status: searchResponse.status,
          },
          level: "error",
          message: "Spotify search request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to search Spotify API: ${searchResponse.status} ${searchResponse.statusText}`,
          operation: "spotify.search",
          resource: "search",
          status: searchResponse.status,
        });
      }

      return (await searchResponse.json()) as SpotifySearchResponse;
    },
  );
}
