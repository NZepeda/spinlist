/**
 * @description Fetches a Spotify token required to query the Spotify API.
 * @returns The Spotify token.
 */
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
    });

    const data = await response.json();

    return Response.json({ token: data.access_token });
  } catch (error) {
    console.error("Error fetching Spotify token:", error);
    return Response.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 }
    );
  }
}
