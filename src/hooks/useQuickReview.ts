"use client";

import { useEffect, useState } from "react";
import { useUserAlbumReview } from "./useUserAlbumReview";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { submitReview } from "@/lib/mutations/submitReview";

/**
 * Hook allowing the upsert a quick review (A star rating from 1 - 5) for a specific album.
 */
export function useQuickReview({ albumId }: { albumId: string }): {
  rating: number;
  onRatingChanged: (newRating: number) => void;
} {
  const { user } = useAuth();
  const { review } = useUserAlbumReview(albumId);

  const [rating, setRating] = useState<number>(review?.rating ?? 0);

  const reviewMutation = useMutation({
    mutationFn: async (newRating: number) => {
      if (!user?.id) {
        throw new Error("You must be logged in to rate");
      }

      if (!review?.id) {
        throw new Error("Album does not exist");
      }

      await submitReview({
        userId: user.id,
        albumId,
        rating: newRating,
        existingReviewId: review.id,
      });
    },
    onSuccess: () => {
      console.log("Successfully set rating");
    },
    onError: () => {
      console.log("Error on quick review");
    },
  });

  // Whenever the rating changes, fire an upsert
  useEffect(() => {
    reviewMutation.mutate(rating);
  }, [rating]);

  return {
    rating,
    onRatingChanged: setRating,
  };
}
