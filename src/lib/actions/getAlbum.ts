/**
 * Gets an album from Spotify.
 * @param albumId The ID of the album to get.
 * @param token The Spotify token to use. If not provided, it will be fetched from the server.
 * @returns The album.
 */
export const getAlbum = async (albumId: string, token?: string) => {
  let spotifyToken = token;

  if (!spotifyToken) {
    const data = await fetch("/api/spotify/token").then((res) => res.json());
    spotifyToken = data.token;
  }

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${spotifyToken}`,
    },
  });

  return response.json();
};
