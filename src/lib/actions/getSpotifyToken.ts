/**
 * Queries the Spotify API for a token.
 */
export const getSpotifyToken = async (
  spotifyToken: string,
  spotifySecret: string
): Promise<{ token: string; expiresIn: number } | undefined> => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${spotifyToken}:${spotifySecret}`
        ).toString("base64")}`,
      },
    });

    const data = await response.json();
    return { token: data.access_token, expiresIn: data.expires_in };
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return undefined;
  }
};
