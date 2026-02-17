import { notFound } from "next/navigation";

import { getImageUrl } from "@/lib/spotify/getImageUrl";
import { ReviewSection } from "@/components/review/ReviewSection";
import { getAlbum } from "@/lib/getAlbum";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Album page displaying information about the Album.
 * If the user is logged in, it displays the review form.
 * Otherwise, prompts the user to log in.
 */
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const album = await getAlbum(slug);

  if (!album) {
    notFound();
  }

  // Ensure album.images is an array of ImageObject and not null
  const images = Array.isArray(album.images) ? album.images : [];

  // TODO Fix this type error.
  // @ts-expect-error - images is an array of ImageObject and not null
  const imageUrl = getImageUrl(images, "large");

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
        {/* Album Image */}
        <div className="flex justify-center lg:justify-start">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={album.title}
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
            <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
            <p className="text-xl text-muted-foreground">
              {album.artist},{" "}
              {album.release_date
                ? new Date(album.release_date).getFullYear()
                : null}
            </p>
            <p className="text-base text-muted-foreground">
              {album.label ? album.label : "Unknown Label"}
            </p>
          </div>

          <ReviewSection album={album} />
        </div>
      </div>

      {/* Tracklist */}
      {album.tracks.length > 0 && (
        <div className="max-w-4xl pb-8">
          <h2 className="text-2xl font-bold mb-4">Tracklist</h2>
          <div className="space-y-2">
            {album.tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-muted-foreground font-medium w-8">
                  {index + 1}.
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
