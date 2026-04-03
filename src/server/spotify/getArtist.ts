import { notFound } from "next/navigation";
import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import type { Artist } from "@/shared/types";
import { getSpotifyToken } from "@/server/spotify/getSpotifyToken";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import type { SpotifyArtistFull } from "@/server/spotify/types";
import { getImageUrl } from "./getImageUrl";

/**
 * Fetches an artist's details from the Spotify API.
 *
 * @param id - The Spotify artist ID
 * @returns A promise that resolves to the Artist object
 * @throws Calls notFound() for 404 responses, throws Error for other failures
 */
export async function getArtist(id: string): Promise<Artist> {
  return await startSpan(
    {
      name: "spotify.artist.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();

      const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }

        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.artist",
            resource: `artists/${id}`,
            status: response.status,
          },
          level: "error",
          message: "Spotify artist request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to fetch artist from Spotify API: ${response.status} ${response.statusText}`,
          operation: "spotify.artist",
          resource: `artists/${id}`,
          status: response.status,
        });
      }

      const data = (await response.json()) as SpotifyArtistFull;

      return {
        id: data.id,
        name: data.name,
        image: getImageUrl(data.images, "medium"),
        externalUrl: data.external_urls?.spotify || "",
      };
    },
  );
}
