"use client";

import { Button } from "@/shared/ui/button";
import { StarRating } from "@/shared/ui/StarRating";
import type { Album } from "@/shared/types";
import type { UseAlbumReviewStateResult } from "@/features/reviews/types";

interface AlbumPrimaryRatingCardProps {
  album: Album;
  onOpenComposer: () => void;
  reviewState: UseAlbumReviewStateResult;
}

/**
 * Returns the saved favorite-song label when the review already has one.
 */
function getSavedFavoriteTrackName(
  album: Album,
  reviewState: UseAlbumReviewStateResult,
): string | null {
  if (!reviewState.hasSavedFavoriteTrack) {
    return null;
  }

  const favoriteTrack = album.tracks.find(
    (track) => track.id === reviewState.savedFavoriteTrackId,
  );

  if (!favoriteTrack) {
    return null;
  }

  return `${favoriteTrack.track_number}. ${favoriteTrack.name}`;
}

/**
 * Keeps the primary signed-in action focused on rating instead of full review editing.
 */
export function AlbumPrimaryRatingCard({
  album,
  onOpenComposer,
  reviewState,
}: AlbumPrimaryRatingCardProps) {
  const savedFavoriteTrackName = getSavedFavoriteTrackName(album, reviewState);
  const ratingHeading = reviewState.hasSavedReview ? "Rated" : "Rate";

  return (
    <div className="flex w-full flex-col rounded-[1.5rem] border border-border/70 bg-card shadow-[0_18px_50px_var(--brand-shadow-soft)] lg:max-w-md">
      <div className="flex items-start justify-center pt-2">
        <p className="text-sm font-medium text-foreground">{ratingHeading}</p>
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

        {reviewState.hasSavedFavoriteTrack || reviewState.hasSavedReviewText ? (
          <div className="w-full rounded-[1.25rem] border border-border/70 bg-background/80 p-4 text-left">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">
              Saved details
            </p>
            {savedFavoriteTrackName ? (
              <p className="mt-2 text-sm font-medium text-foreground">
                Favorite song: {savedFavoriteTrackName}
              </p>
            ) : null}
            {reviewState.hasSavedReviewText ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reviewState.savedReviewText}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
