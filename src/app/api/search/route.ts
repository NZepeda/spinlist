import { NextRequest, NextResponse } from "next/server";

// Token cache
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getSpotifyToken(): Promise<string> {
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
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  // TODO: Add proper typing for token response
  const tokenData = await tokenResponse.json();
  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

  if (!cachedToken) {
    throw new Error("Failed to retrieve access token");
  }

  return cachedToken;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  try {
    // Get Spotify access token (cached)
    const accessToken = await getSpotifyToken();

    // Search for both artists and albums
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=artist,album&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to search Spotify API");
    }

    const searchData = await searchResponse.json();

    return NextResponse.json({
      artists: searchData.artists.items.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || null,
        followers: artist.followers.total,
        type: "artist" as const,
      })),
      albums: searchData.albums.items.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || "Unknown Artist",
        image: album.images[0]?.url || null,
        release_date: album.release_date,
        type: "album" as const,
      })),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
