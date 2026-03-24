import { notFound } from "next/navigation";

import { getImageUrl } from "@/server/spotify/getImageUrl";
import { getAlbum } from "@/features/albums/server/getAlbum";
import { getAlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";
import { getAlbumReviewFeed } from "@/features/reviews/server/getAlbumReviewFeed";
import { AlbumReviewFlow } from "@/features/reviews/components/AlbumReviewFlow";
import { ReviewsFeed } from "@/features/reviews/components/ReviewsFeed";

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
  const [communitySummary, reviewFeed] = await Promise.all([
    getAlbumCommunitySummary(album),
    getAlbumReviewFeed(album),
  ]);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-warm to-background" />
      <div className="absolute -top-18 left-0 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle_at_top,var(--brand-aura-medium),transparent)] blur-3xl md:left-10 md:h-[340px] md:w-[340px]" />
      <div className="absolute right-0 top-12 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-aura-soft),transparent)] blur-3xl md:top-20 md:h-[420px] md:w-[420px]" />

      <div className="app-shell relative py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,26rem)_minmax(0,1fr)] lg:items-start">
          <div className="relative self-start">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,var(--brand-aura-subtle),transparent)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/95 p-3 shadow-[0_24px_64px_var(--brand-shadow-soft)] backdrop-blur md:rounded-[2rem]">
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
          <AlbumReviewFlow album={album} communitySummary={communitySummary} />
        </div>
        <div className="mt-6">
          <ReviewsFeed reviews={reviewFeed} />
        </div>
      </div>
    </main>
  );
}
