"use client";

import { useCallback, useState } from "react";
import { useUserAlbumReview } from "./useUserAlbumReview";
import { useAuth } from "./useAuth";
import {
  useQuickReviewMutation,
  type QuickReviewMutationResult,
} from "./useQuickReviewMutation";

interface UseQuickReviewParams {
  albumId: string;
}

interface UseQuickReviewResult {
  rating: number;
  onRatingChanged: (newRating: number) => void;
  error: Error | null;
  isSaving: boolean;
}

/**
 * Manages quick review ratings (0-5 in 0.5 steps) with optimistic updates and error handling.
 */
export function useQuickReview({
  albumId,
}: UseQuickReviewParams): UseQuickReviewResult {
  const { user } = useAuth();
  const { review } = useUserAlbumReview(albumId);

  const userId = user?.id ?? null;
  const [error, setError] = useState<Error | null>(null);

  console.log({ review });

  const rating = review?.rating ?? 0;

  // When a user rates an album for the first time, we immediately write a fake
  // Review to the cache (with id "optimistic:albumId:userId") before the server
  // responds. We detect this sentinel prefix to:
  //   1. Block further mutations until the server confirms the insert — preventing
  //      a second tap from trying to update a review that doesn't exist in the DB yet.
  //   2. Pass null as existingReviewId so submitReview does an INSERT, not an UPDATE,
  //      once the real request resolves and the cache is revalidated.
  const hasOptimisticReview = Boolean(
    review?.id && review.id.startsWith("optimistic:"),
  );
  const existingReviewId = hasOptimisticReview ? null : (review?.id ?? null);

  const reviewMutation: QuickReviewMutationResult = useQuickReviewMutation({
    albumId,
    userId,
    existingReviewId,
    onSuccess: () => {
      setError(null);
    },
    onError: (mutationError) => {
      const nextError =
        mutationError instanceof Error
          ? mutationError
          : new Error("Unable to save rating");
      setError(nextError);
    },
  });

  const onRatingChanged = useCallback(
    (newRating: number) => {
      if (!userId) {
        setError(new Error("You must be logged in to rate"));
        return;
      }

      if (reviewMutation.isPending || hasOptimisticReview) {
        setError(
          new Error("Please wait for the current rating to finish saving."),
        );
        return;
      }

      const isFiniteNumber = Number.isFinite(newRating);
      const isWithinRange = newRating >= 0 && newRating <= 5;
      const isHalfStep = Number.isInteger(newRating * 2);

      if (!isFiniteNumber || !isWithinRange || !isHalfStep) {
        setError(
          new Error("Rating must be between 0 and 5 in 0.5 increments."),
        );
        return;
      }

      if (newRating === rating) {
        return;
      }

      setError(null);
      reviewMutation.mutate(newRating);
    },
    [hasOptimisticReview, rating, reviewMutation, userId],
  );

  return {
    rating,
    onRatingChanged,
    error,
    isSaving: reviewMutation.isPending,
  };
}
