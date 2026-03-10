import type { SpotifyAlbumFull } from "@/lib/types/api/spotify";
import type { AlbumSummaryDTO } from "@/lib/types/dto/album";
import { getImageUrl } from "@/lib/spotify/getImageUrl";

/**
 * Maps a Spotify album payload to a lightweight album summary DTO.
 */
export function mapSpotifyAlbumToAlbumSummaryDTO(
  album: SpotifyAlbumFull,
): AlbumSummaryDTO {
  const artistName = album.artists
    .map((artist) => artist.name)
    .filter((name) => name.length > 0)
    .join(", ");

  return {
    id: album.id,
    name: album.name,
    artistName: artistName || "Unknown Artist",
    imageUrl: getImageUrl(album.images, "medium"),
    images: album.images.map((image) => ({
      url: image.url,
      height: image.height,
      width: image.width,
    })),
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    label: album.label,
  };
}
