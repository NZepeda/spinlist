import { AlbumHeroCard } from "@/features/reviews/components/AlbumHeroCard";
import { ReviewsFeed } from "@/features/reviews/components/ReviewsFeed";
import type { AlbumReviewFeedItem } from "@/features/reviews/types";
import type { AlbumRecord } from "@/shared/types";
import { AppPage } from "@/shared/ui/AppPage";

interface AlbumPageShellProps {
  album: AlbumRecord;
  imageUrl: string | null;
  reviewFeed: AlbumReviewFeedItem[];
}

/**
 * Owns the album-page hierarchy so the same section order stays consistent across screen sizes.
 */
export function AlbumPageShell({
  album,
  imageUrl,
  reviewFeed,
}: AlbumPageShellProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-warm to-background" />
      <div className="absolute -top-18 left-0 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle_at_top,var(--brand-aura-medium),transparent)] blur-3xl md:left-10 md:h-[340px] md:w-[340px]" />
      <div className="absolute right-0 top-12 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-aura-soft),transparent)] blur-3xl md:top-20 md:h-[420px] md:w-[420px]" />

      <AppPage className="relative">
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,26rem)_minmax(0,1fr)] lg:items-start">
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

            <AlbumHeroCard album={album} />
          </section>

          <ReviewsFeed reviews={reviewFeed} />
        </div>
      </AppPage>
    </main>
  );
}
