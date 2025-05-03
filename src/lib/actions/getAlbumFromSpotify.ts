import { Database } from "../types/supabase.types";

type SpotifyAlbum = {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
  tracks: {
    items: Array<{
      id: string;
      name: string;
      duration_ms: number;
      track_number: number;
    }>;
  };
};

type DatabaseAlbum = Database["public"]["Tables"]["albums"]["Row"];

export async function getAlbumFromSpotify(
  albumId: string,
  token?: string
): Promise<Omit<DatabaseAlbum, "id">> {
  let spotifyToken = token;

  if (!spotifyToken) {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/token`
    ).then((res) => res.json());
    spotifyToken = data.token;
  }

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${spotifyToken}`,
    },
  });

  const spotifyAlbum: SpotifyAlbum = await response.json();

  return {
    spotify_id: spotifyAlbum.id,
    title: spotifyAlbum.name,
    artist: spotifyAlbum.artists[0].name,
    artist_id: spotifyAlbum.artists[0].id,
    cover_url: spotifyAlbum.images[0]?.url ?? null,
    release_date: spotifyAlbum.release_date,
    spotify_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracks: spotifyAlbum.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      duration_ms: track.duration_ms,
      track_number: track.track_number,
    })),
  };
}
