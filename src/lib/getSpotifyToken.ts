let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Retrieves a Spotify access token using client credentials flow.
 * Tokens are cached for their lifetime with a 5-minute buffer before expiration.
 *
 * @returns A promise that resolves to the Spotify access token
 * @throws Error if the token cannot be retrieved
 */
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  // Fetch new token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const tokenData = await tokenResponse.json();

  // TODO Fix this
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  cachedToken = tokenData.access_token;

  // TODO Fix this
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

  if (!cachedToken) {
    throw new Error("Failed to retrieve access token");
  }

  return cachedToken;
}
