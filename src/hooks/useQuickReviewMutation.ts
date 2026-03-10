"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReview } from "@/lib/mutations/submitReview";
import type { Review } from "@/lib/types";

interface UseQuickReviewMutationParams {
  albumId: string;
  userId: string | null;
  existingReviewId?: string | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface QuickReviewMutationContext {
  previousReview: Review | null;
}

export interface QuickReviewMutationResult {
  mutate: (rating: number) => void;
  isPending: boolean;
}

/**
 * Creates an optimistic mutation for upserting a quick review rating for a specific album.
 * Keeps the user review query in sync with server state.
 */
export function useQuickReviewMutation({
  albumId,
  userId,
  existingReviewId,
  onSuccess,
  onError,
}: UseQuickReviewMutationParams): QuickReviewMutationResult {
  const queryClient = useQueryClient();
  const reviewQueryKey = ["userReview", userId, albumId] as const;

  const mutation = useMutation<void, Error, number, QuickReviewMutationContext>(
    {
      mutationFn: async (newRating: number) => {
        if (!userId) {
          throw new Error("You must be logged in to rate");
        }

        await submitReview({
          userId,
          albumId,
          rating: newRating,
          existingReviewId: existingReviewId ?? undefined,
        });
      },
      onMutate: async (newRating: number) => {
        if (!userId) {
          return { previousReview: null };
        }

        // Cancel any pending queries for the review query key.
        await queryClient.cancelQueries({ queryKey: reviewQueryKey });

        const previousReview =
          queryClient.getQueryData<Review | null>(reviewQueryKey) ?? null;

        const now = new Date().toISOString();

        if (previousReview) {
          const updatedReview = {
            ...previousReview,
            rating: newRating,
            updated_at: now,
          };

          queryClient.setQueryData<Review | null>(
            reviewQueryKey,
            updatedReview,
          );
        } else {
          const optimisticReview: Review = {
            id: `optimistic:${albumId}:${userId}`,
            album_id: albumId,
            user_id: userId,
            rating: newRating,
            review_text: null,
            favorite_track_id: null,
            created_at: now,
            updated_at: now,
          };

          queryClient.setQueryData<Review | null>(
            reviewQueryKey,
            optimisticReview,
          );
        }

        return { previousReview };
      },
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error, _newRating, context) => {
        const previousReview = context?.previousReview ?? null;

        queryClient.setQueryData<Review | null>(reviewQueryKey, previousReview);

        if (onError) {
          onError(error);
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: reviewQueryKey });
      },
    },
  );

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
}
