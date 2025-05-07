import { getSpotifyToken } from "@/lib/actions/getSpotifyToken";

/**
 * @description Fetches a Spotify token required to query the Spotify API.
 * @returns The Spotify token.
 */
export async function GET() {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifySecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!spotifyClientId || !spotifySecret) {
    return Response.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 }
    );
  }
  const tokenData = await getSpotifyToken(spotifyClientId, spotifySecret);

  if (!tokenData) {
    return Response.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 }
    );
  }
  const { token, expiresIn } = tokenData;
  return Response.json({ token, expiresIn }, { status: 200 });
}
