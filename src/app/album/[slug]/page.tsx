import { notFound } from "next/navigation";

import { getImageUrl } from "@/lib/spotify/getImageUrl";
import { getAlbum } from "@/lib/getAlbum";
import { getAlbumCommunitySummary } from "@/lib/getAlbumCommunitySummary";
import { AlbumReviewExperience } from "./AlbumReviewExperience";

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

  const imageUrl = getImageUrl(album.images, "large");
  const communitySummary = await getAlbumCommunitySummary(album);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 mb-12 lg:grid-cols-2 lg:items-start">
        {/* Album Image */}
        <div className="flex justify-center self-start lg:justify-start">
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
        <AlbumReviewExperience
          album={album}
          communitySummary={communitySummary}
        />
      </div>
    </main>
  );
}
