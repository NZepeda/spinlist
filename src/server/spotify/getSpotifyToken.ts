import { addBreadcrumb } from "@/monitoring/addBreadcrumb";
import { startSpan } from "@/monitoring/startSpan";
import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Retrieves a Spotify access token using client credentials flow.
 * Tokens are cached for their lifetime with a 5-minute buffer before expiration.
 *
 * @returns A promise that resolves to the Spotify access token
 * @throws Error if the token cannot be retrieved
 */
export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const tokenData = await startSpan(
    {
      name: "spotify.token.fetch",
      op: "http.client.spotify",
    },
    async () => {
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
        addBreadcrumb({
          category: "spotify.request",
          data: {
            operation: "spotify.token",
            resource: "api/token",
            status: tokenResponse.status,
          },
          level: "error",
          message: "Spotify token request failed",
        });

        throw new SpotifyDependencyError({
          message: `Failed to get Spotify access token: ${tokenResponse.status} ${tokenResponse.statusText}`,
          operation: "spotify.token",
          resource: "api/token",
          status: tokenResponse.status,
        });
      }

      return (await tokenResponse.json()) as SpotifyTokenResponse;
    },
  );

  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

  if (!cachedToken) {
    throw new SpotifyDependencyError({
      message: "Failed to retrieve access token from Spotify",
      operation: "spotify.token",
      resource: "api/token",
    });
  }

  return cachedToken;
}
