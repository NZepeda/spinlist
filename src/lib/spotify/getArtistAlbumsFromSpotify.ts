import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { SpotifyAlbumFull, SpotifyImage } from "../types/spotify.types";

/**
 * Fetches all albums for a given artist from the Spotify API.
 * TODO: The albums should be fetched from the database instead of Spotify API directly.
 */
export async function getArtistAlbumsFromSpotify(artistId: string): Promise<
  {
    id: string;
    name: string;
    artist: string;
    images: SpotifyImage[];
    release_date: string;
    total_tracks: number;
    label: string;
  }[]
> {
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
    .filter((album: { album_type: string }) => album.album_type === "album")
    .map(
      (album: {
        id: string;
        name: string;
        artists: Array<{ name: string }>;
        images: SpotifyImage[];
        release_date: string;
        total_tracks: number;
        label: string;
      }) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || "Unknown Artist",
        images: album.images,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        label: album.label,
      }),
    );

  return albums;
}
