import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/getSpotifyToken";

/**
 * Returns the URL of the smallest image from an array of images.
 */
function getSmallestImageUrl(
  images: { url: string; height: number; width: number }[]
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  let smallest = images[0];

  for (const img of images) {
    if (img.height < smallest.height) {
      smallest = img;
    }
  }

  return smallest.url;
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
        image: getSmallestImageUrl(artist.images),
        followers: artist.followers.total,
        type: "artist" as const,
      })),
      albums: searchData.albums.items.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || "Unknown Artist",
        image: getSmallestImageUrl(album.images),
        release_date: album.release_date,
        type: "album" as const,
      })),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
