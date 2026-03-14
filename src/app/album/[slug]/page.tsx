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
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-warm to-background" />
      <div className="absolute -top-24 left-10 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_top,_oklch(0.62_0.175_47/16%),_oklch(0.62_0.175_47/0%))] blur-3xl" />
      <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_oklch(0.62_0.175_47/12%),_oklch(0.62_0.175_47/0%))] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,26rem)_minmax(0,1fr)] lg:items-start">
          <div className="relative self-start">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_oklch(0.62_0.175_47/14%),_oklch(0.62_0.175_47/0%))] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/80 p-3 shadow-[0_24px_80px_oklch(0.15_0.005_50/12%)] backdrop-blur">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={album.title}
                  className="aspect-square w-full rounded-[1.35rem] object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-[1.35rem] bg-muted">
                  <span className="text-lg text-muted-foreground">
                    No Image
                  </span>
                </div>
              )}
            </div>
          </div>
          <AlbumReviewExperience
            album={album}
            communitySummary={communitySummary}
          />
        </div>
      </div>
    </main>
  );
}
