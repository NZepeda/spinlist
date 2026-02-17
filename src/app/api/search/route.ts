/**
 * Indeed, searching for albums and artists could be done directly from the client, but having a server route allows us to:
 * - securely handle the Spotify API token without exposing it to the client
 */

import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { SpotifySearchResponse } from "@/lib/types/spotify.types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 },
    );
  }

  try {
    // Get Spotify access token (cached)
    const accessToken = await getSpotifyToken();

    // Search for both artists and albums
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query,
      )}&type=artist,album&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to search Spotify API");
    }

    const searchData = (await searchResponse.json()) as SpotifySearchResponse;

    return NextResponse.json({
      artists: searchData.artists.items,
      albums: searchData.albums.items.filter(
        (album) => album.album_type !== "single",
      ),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
