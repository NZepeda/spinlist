/**
 * Search for albums vai the Spotify API.
 * @param query - The search query
 * @param token - The Spotify API token
 * @returns The albums
 */
export const searchSpotifyAlbums = async (query: string, token: string) => {
  if (!query) {
    return { albums: { items: [] } };
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=album&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch albums");
  }

  return response.json();
};
