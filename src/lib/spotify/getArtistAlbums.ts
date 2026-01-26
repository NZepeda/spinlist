import { Album } from "@/lib/types/album";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getLargestImageUrl } from "./getLargestImageUrl";

/**
 * Fetches all albums for a given artist from the Spotify API.
 * Note: The albums endpoint does not include track details, so tracks will be undefined.
 *
 * @param artistId - The Spotify artist ID
 * @returns A promise that resolves to an array of Album objects
 * @throws Error if the API request fails
 */
export async function getArtistAlbums(artistId: string): Promise<Album[]> {
  const accessToken = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch artist albums from Spotify API");
  }

  const data = await response.json();

  return data.items.map((album: any) => ({
    id: album.id,
    name: album.name,
    artist: album.artists[0]?.name || "Unknown Artist",
    image: getLargestImageUrl(album.images),
    release_date: album.release_date,
    total_tracks: album.total_tracks,
  }));
}
