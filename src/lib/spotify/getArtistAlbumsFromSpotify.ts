import { getSpotifyToken } from "@/lib/getSpotifyToken";
import type { SpotifyAlbumFull } from "@/lib/types/api/spotify";
import type { AlbumSummaryDTO } from "@/lib/types/dto/album";
import { mapSpotifyAlbumToAlbumSummaryDTO } from "@/lib/mappers/spotify/mapSpotifyAlbumToAlbumSummaryDto";

/**
 * Fetches all albums for a given artist from the Spotify API.
 * Returns a lightweight album summary DTO for UI and sync usage.
 * TODO: The albums should be fetched from the database instead of Spotify API directly.
 */
export async function getArtistAlbumsFromSpotify(
  artistId: string,
): Promise<AlbumSummaryDTO[]> {
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
    throw new Error("Failed to fetch artist albums from Spotify API");
  }

  const data = (await response.json()) as { items: SpotifyAlbumFull[] };

  const albums = data.items
    .filter((album: SpotifyAlbumFull) => album.album_type === "album")
    .map(mapSpotifyAlbumToAlbumSummaryDTO);

  return albums;
}
