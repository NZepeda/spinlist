import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getImageUrl } from "@/lib/spotify/getImageUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing album ID parameter" },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getSpotifyToken();

    const albumResponse = await fetch(
      `https://api.spotify.com/v1/albums/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!albumResponse.ok) {
      if (albumResponse.status === 404) {
        return NextResponse.json({ error: "Album not found" }, { status: 404 });
      }
      throw new Error("Failed to fetch album from Spotify API");
    }

    const albumData = await albumResponse.json();

    return NextResponse.json({
      id: albumData.id,
      name: albumData.name,
      artist: albumData.artists[0]?.name || "Unknown Artist",
      image: getImageUrl(albumData.images),
      release_date: albumData.release_date,
      total_tracks: albumData.total_tracks,
      tracks: albumData.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
      })),
    });
  } catch (error) {
    console.error("Album API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 },
    );
  }
}
