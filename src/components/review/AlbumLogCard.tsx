"use client";

import { StarRating } from "../StarRating";
import { Button } from "@/components/ui-core/button";
import { Select, SelectOption } from "@/components/ui-core/select";
import { Textarea } from "@/components/ui-core/textarea";
import type { Album } from "@/lib/types";
import { useReviewForm } from "@/hooks/useReviewForm";
import { useUserAlbumReview } from "@/hooks/useUserAlbumReview";

interface AlbumLogCardProps {
  album: Album;
}

/**
 * Compact album logging card used on the album page.
 * Lets a signed-in listener set a rating and explicitly save it as part of an album log.
 */
export function AlbumLogCard({ album }: AlbumLogCardProps) {
  const { review } = useUserAlbumReview(album.id);
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
  } = useReviewForm({
    album,
    existingReview: review,
  });

  let buttonLabel = "Log this album";

  if (isLoading) {
    buttonLabel = "Saving...";
  } else if (isEditMode && !isDirty) {
    buttonLabel = "Saved";
  } else if (isEditMode) {
    buttonLabel = "Save changes";
  }

  return (
    <div className="flex w-full flex-col rounded-md border bg-card lg:max-w-md">
      <div className="border-b w-full p-4">
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
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={`favorite-track-${album.id}`}
          >
            Favorite song <span className="text-muted-foreground">(optional)</span>
          </label>
          <Select
            id={`favorite-track-${album.id}`}
            className="min-w-full"
            value={favoriteTrackId}
            onChange={(event) => {
              setFavoriteTrackId(event.target.value);
            }}
          >
            <SelectOption value="">Pick a song</SelectOption>
            {album.tracks.map((track) => (
              <SelectOption key={track.id} value={track.id}>
                {track.track_number}. {track.name}
              </SelectOption>
            ))}
          </Select>
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
