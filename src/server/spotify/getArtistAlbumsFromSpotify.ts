import { startSpan } from "@/monitoring/startSpan";
import type { AlbumSummaryDTO } from "@/shared/types/dto/album";
import { getArtistAlbumDetailsFromSpotify } from "@/server/spotify/getArtistAlbumDetailsFromSpotify";
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
      const spotifyAlbums = await getArtistAlbumDetailsFromSpotify(artistId);

      return spotifyAlbums
        .map(mapSpotifyAlbumToAlbumSummaryDTO);
    },
  );
}
