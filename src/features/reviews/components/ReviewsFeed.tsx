import type { AlbumReviewFeedItem } from "@/features/reviews/server/getAlbumReviewFeed";

interface ReviewsFeedProps {
  reviews: AlbumReviewFeedItem[];
}

/**
 * Formats a review rating for compact display.
 */
function formatRating(rating: number): string {
  return `${rating.toFixed(1)}/5`;
}

/**
 * Formats a review timestamp for display in the feed.
 */
function formatReviewDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

/**
 * Renders recent written reviews for the album page.
 */
export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-surface/95 p-4 shadow-[0_20px_60px_var(--brand-shadow-soft)] backdrop-blur sm:p-6 xl:rounded-[2rem] xl:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">Recent reviews</h2>
        <p className="text-sm text-muted-foreground">
          See what listeners chose to write down after sitting with this album.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background/40 p-4 text-sm text-muted-foreground">
          No written reviews yet. The first note can set the tone for this
          album.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-[0_16px_40px_var(--brand-shadow-soft)] md:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    @{review.username}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground-muted">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="rounded-full border border-foreground/10 bg-[var(--brand-tint-soft)] px-3 py-1 text-sm font-semibold text-foreground">
                  {formatRating(review.rating)}
                </div>
              </div>

              {review.favoriteTrackName ? (
                <div className="mt-4 inline-flex rounded-full border border-border/70 bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground">
                  Favorite song: {review.favoriteTrackName}
                </div>
              ) : null}

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {review.reviewText}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
