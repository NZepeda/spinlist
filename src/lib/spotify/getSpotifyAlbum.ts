import { getSpotifyToken } from "../getSpotifyToken";
import { SpotifyAlbumFull } from "../types/spotify.types";

/**
 * Gets an album from Spotify
 */
export async function getSpotifyAlbum(
  id: string,
): Promise<SpotifyAlbumFull | undefined> {
  const accessToken = await getSpotifyToken();

  const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!albumResponse.ok) {
    if (albumResponse.status === 404) {
      return undefined;
    }
    throw new Error("Failed to fetch album from Spotify API");
  }

  const spotifyAlbum = (await albumResponse.json()) as SpotifyAlbumFull;

  return spotifyAlbum;
}
