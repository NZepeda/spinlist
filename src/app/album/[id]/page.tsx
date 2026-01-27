import { notFound } from "next/navigation";
import { Album } from "@/lib/types/album";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getImageUrl } from "@/lib/spotify/getImageUrl";
import { ReviewSection } from "@/components/review/ReviewSection";
import { createClient } from "@/lib/supabase/server";
import { getSpotifyIdFromSlug } from "@/lib/spotify/getSpotifyIdFromSlug";

async function getAlbum(id: string): Promise<Album> {
  try {
    const accessToken = await getSpotifyToken();

    const albumResponse = await fetch(
      `https://api.spotify.com/v1/albums/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!albumResponse.ok) {
      if (albumResponse.status === 404) {
        notFound();
      }
      throw new Error("Failed to fetch album from Spotify API");
    }

    const albumData = await albumResponse.json();

    return {
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
    };
  } catch (error) {
    console.error("Failed to fetch album:", error);
    throw error;
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabaseClient = await createClient();
  const spotifyId = await getSpotifyIdFromSlug(id, {
    supabaseClient,
    itemType: "album",
  });

  if (!spotifyId) {
    notFound();
  }

  const album = await getAlbum(spotifyId);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Album Image */}
        <div className="flex justify-center lg:justify-start">
          {album.image ? (
            <img
              src={album.image}
              alt={album.name}
              className="w-full max-w-md rounded-lg shadow-lg aspect-square object-cover"
            />
          ) : (
            <div className="w-full max-w-md aspect-square rounded-lg bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-lg">No Image</span>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{album.name}</h1>
            <p className="text-xl text-muted-foreground">{album.artist}</p>
          </div>

          <ReviewSection album={album} />
        </div>
      </div>

      {/* Tracklist */}
      {album.tracks && album.tracks.length > 0 && (
        <div className="max-w-4xl pb-8">
          <h2 className="text-2xl font-bold mb-4">Tracklist</h2>
          <div className="space-y-2">
            {album.tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-muted-foreground font-medium w-8">
                  {track.track_number}.
                </span>
                <span className="flex-1 font-medium">{track.name}</span>
                <span className="text-muted-foreground text-sm">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
