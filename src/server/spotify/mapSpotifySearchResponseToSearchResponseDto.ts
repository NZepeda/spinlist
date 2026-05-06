import type { SpotifySearchResponse } from "@/server/spotify/types";
import type { SearchResponseDTO } from "@/shared/types/dto/search";
import { getImageUrl } from "@/server/spotify/getImageUrl";

/**
 * Maps a Spotify search response to the API search response DTO.
 */
export function mapSpotifySearchResponseToSearchResponseDTO(
  response: SpotifySearchResponse,
): SearchResponseDTO {
  const artists = response.artists?.items ?? [];
  const albums = response.albums?.items ?? [];

  return {
    artists: artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      // We use the "small" image size for search results to optimize payload size and loading times.
      imageUrl: getImageUrl(artist.images, "small"),
      type: "artist",
    })),
    albums: albums
      .filter((album) => album.album_type !== "single")
      .map((album) => {
        return {
          id: album.id,
          name: album.name,
          artists: album.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
          })),
          // We use the "small" image size for search results to optimize payload size and loading times.
          imageUrl: getImageUrl(album.images, "small"),
          releaseDate: album.release_date,
          type: "album",
        };
      }),
  };
}
