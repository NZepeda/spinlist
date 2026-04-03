import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import { getSpotifyToken } from "@/server/spotify/getSpotifyToken";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";
import type { SpotifyAlbumFull } from "@/server/spotify/types";
import type { AlbumSummaryDTO } from "@/shared/types/dto/album";
import { mapSpotifyAlbumToAlbumSummaryDTO } from "@/server/spotify/mapSpotifyAlbumToAlbumSummaryDto";

/**
 * Fetches all albums for a given artist from the Spotify API.
 * Returns a lightweight album summary DTO for UI and sync usage.
 * TODO: The albums should be fetched from the database instead of Spotify API directly.
 */
export async function getArtistAlbumsFromSpotify(
  artistId: string,
): Promise<AlbumSummaryDTO[]> {
  return await startSpan(
    {
      name: "spotify.artist_albums.fetch",
      op: "http.client.spotify",
    },
    async () => {
      const accessToken = await getSpotifyToken();

      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.artist_albums",
            resource: `artists/${artistId}/albums`,
            status: response.status,
          },
          level: "error",
          message: "Spotify artist albums request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to fetch artist albums from Spotify API: ${response.status} ${response.statusText}`,
          operation: "spotify.artist_albums",
          resource: `artists/${artistId}/albums`,
          status: response.status,
        });
      }

      const data = (await response.json()) as { items: SpotifyAlbumFull[] };

      return data.items
        .filter((album: SpotifyAlbumFull) => album.album_type === "album")
        .map(mapSpotifyAlbumToAlbumSummaryDTO);
    },
  );
}
