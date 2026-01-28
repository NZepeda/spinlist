import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getImageUrl } from "@/lib/spotify/getImageUrl";
import { SpotifyImage } from "@/lib/types/album";

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

    const searchData = await searchResponse.json();

    return NextResponse.json({
      artists: searchData.artists.items.map((artist: { id: string; name: string; images: SpotifyImage[] }) => ({
        id: artist.id,
        name: artist.name,
        image: getImageUrl(artist.images, "small"),
        type: "artist" as const,
      })),
      albums: searchData.albums.items.map((album: { id: string; name: string; artists: { name: string }[]; images: SpotifyImage[]; release_date: string }) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || "Unknown Artist",
        images: album.images,
        release_date: album.release_date,
        type: "album" as const,
      })),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
