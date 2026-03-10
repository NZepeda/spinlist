import type { SpotifySearchResponse } from "@/lib/types/api/spotify";
import type { SearchResponseDTO } from "@/lib/types/dto/search";
import { getImageUrl } from "@/lib/spotify/getImageUrl";

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
      imageUrl: getImageUrl(artist.images, "small"),
      type: "artist",
    })),
    albums: albums
      .filter((album) => album.album_type !== "single")
      .map((album) => {
        const artistNames = album.artists
          .map((artist) => artist.name)
          .filter((name) => name.length > 0);

        const artistName =
          artistNames.length > 0 ? artistNames.join(", ") : "Unknown Artist";

        return {
          id: album.id,
          name: album.name,
          artistName,
          imageUrl: getImageUrl(album.images, "small"),
          releaseDate: album.release_date,
          type: "album",
        };
      }),
  };
}
