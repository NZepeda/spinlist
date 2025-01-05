export const getAlbum = async (albumId: string) => {
  const data = await fetch("/api/spotify/token").then((res) => res.json());

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  });

  return response.json();
};
