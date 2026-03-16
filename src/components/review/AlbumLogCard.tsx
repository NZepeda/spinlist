"use client";

import { StarRating } from "../StarRating";
import { Button } from "@/components/ui-core/button";
import { Textarea } from "@/components/ui-core/textarea";
import type { Album } from "@/lib/types";
import type { UseReviewFormResult } from "@/hooks/useReviewForm";

interface AlbumLogCardProps {
  album: Album;
  reviewForm: UseReviewFormResult;
}

/**
 * Compact album logging card used on the album page.
 * Lets a signed-in listener set a rating and explicitly save it as part of an album log.
 */
export function AlbumLogCard({ album, reviewForm }: AlbumLogCardProps) {
  const {
    favoriteTrackId,
    rating,
    reviewText,
    errors,
    handleSubmit,
    isDirty,
    isEditMode,
    isLoading,
    setFavoriteTrackId,
    setRating,
    setReviewText,
  } = reviewForm;
  const favoriteTrack =
    album.tracks.find((track) => track.id === favoriteTrackId) ?? null;

  let buttonLabel = "Log this album";

  if (isLoading) {
    buttonLabel = "Saving...";
  } else if (isEditMode && !isDirty) {
    buttonLabel = "Saved";
  } else if (isEditMode) {
    buttonLabel = "Save changes";
  }

  return (
    <div className="flex w-full flex-col rounded-md border border-border/70 bg-card shadow-[0_18px_50px_var(--brand-shadow-soft)] lg:max-w-md">
      <div className="w-full border-b border-border/70 p-4">
        <div className="text-sm font-medium text-center">
          {rating ? "Your rating" : "Rate"}
        </div>
        <div className="flex justify-center">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        {errors.rating && (
          <p className="mt-3 text-center text-sm text-error">
            {errors.rating}
          </p>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">
            Favorite song <span className="text-muted-foreground">(optional)</span>
          </div>
          <div className="rounded-lg border border-border/70 bg-background p-3">
            <div className="text-sm text-foreground">
              {favoriteTrack
                ? `${favoriteTrack.track_number}. ${favoriteTrack.name}`
                : "Pick a song from the tracklist below."}
            </div>
            {favoriteTrack ? (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-brand hover:text-brand-hover"
                onClick={() => {
                  setFavoriteTrackId("");
                }}
              >
                Clear pick
              </button>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={`review-text-${album.id}`}
          >
            Thoughts <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id={`review-text-${album.id}`}
            value={reviewText}
            maxLength={2000}
            placeholder="What stuck with you?"
            aria-invalid={Boolean(errors.reviewText)}
            onChange={(event) => {
              setReviewText(event.target.value);
            }}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Short notes are enough.</span>
            <span>{reviewText.length}/2000</span>
          </div>
          {errors.reviewText && (
            <p className="text-sm text-error">{errors.reviewText}</p>
          )}
        </div>
        {errors.general && (
          <p className="mt-3 text-center text-sm text-error">
            {errors.general}
          </p>
        )}
      </div>
      <Button
        variant={isDirty ? "brand" : "ghost"}
        className="w-full rounded-none text-sm"
        disabled={!isDirty || isLoading}
        onClick={handleSubmit}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
