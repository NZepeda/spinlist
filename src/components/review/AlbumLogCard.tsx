"use client";

import { StarRating } from "../StarRating";
import { Button } from "@/components/ui-core/button";
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
  const { rating, errors, handleSubmit, isDirty, isEditMode, isLoading, setRating } =
    useReviewForm({
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
    <div className="flex justify-center align-center flex-col w-full lg:w-fit border rounded-md bg-card">
      <div className="border-b w-full p-4 flex justify-center flex-col">
        <div className="text-sm font-medium text-center">
          {rating ? "Your rating" : "Rate"}
        </div>
        <div className="flex justify-center">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        {(errors.rating || errors.general) && (
          <p className="mt-3 text-center text-sm text-error">
            {errors.rating ?? errors.general}
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
