"use client";

import { Button } from "@/shared/ui/button";
import { StarRating } from "@/shared/ui/StarRating";
import type { UseAlbumReviewStateResult } from "@/features/reviews/hooks/useAlbumReviewState";

interface AlbumPrimaryRatingCardProps {
  onOpenComposer: () => void;
  reviewState: UseAlbumReviewStateResult;
}

/**
 * Returns the short status line that explains whether the rating is saved or still syncing.
 */
function getRatingStatusMessage(
  reviewState: UseAlbumReviewStateResult,
): string {
  if (reviewState.ratingError) {
    return reviewState.ratingError;
  }

  if (reviewState.isRatingSaving) {
    return "Saving your rating...";
  }

  if (reviewState.hasSavedReview) {
    return "Saved to your log. Update it any time.";
  }

  return "Tap a star to rate this album. Your score saves instantly.";
}

/**
 * Keeps the primary signed-in action focused on rating instead of full review editing.
 */
export function AlbumPrimaryRatingCard({
  onOpenComposer,
  reviewState,
}: AlbumPrimaryRatingCardProps) {
  const statusMessage = getRatingStatusMessage(reviewState);
  const ratingHeading = reviewState.hasSavedReview
    ? "Your rating"
    : "Rate this album";
  const ratingValueLabel =
    reviewState.rating > 0
      ? `${reviewState.rating.toFixed(1)} / 5`
      : "Choose your score";

  return (
    <div className="flex w-full flex-col rounded-[1.5rem] border border-border/70 bg-card shadow-[0_18px_50px_var(--brand-shadow-soft)] lg:max-w-md">
      <div className="border-b border-border/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {ratingHeading}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {ratingValueLabel}
            </p>
          </div>
          {reviewState.hasSavedReview ? (
            <div className="rounded-full border border-border/70 bg-[var(--brand-tint-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Saved
            </div>
          ) : null}
        </div>
        <p
          className={
            reviewState.ratingError
              ? "mt-3 text-sm text-error"
              : "mt-3 text-sm text-muted-foreground"
          }
          role={reviewState.ratingError ? "alert" : undefined}
        >
          {statusMessage}
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 p-5">
        <StarRating
          value={reviewState.rating}
          onChange={reviewState.setRating}
          size="lg"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onOpenComposer}
        >
          {reviewState.hasSavedReviewText
            ? "Edit review details"
            : "Add review details"}
        </Button>
        <p className="text-center text-sm text-foreground-muted">
          Rating stays lightweight here. Notes save separately inside the
          composer.
        </p>
      </div>
    </div>
  );
}
