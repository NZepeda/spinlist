"use client";

import { useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { submitReview } from "@/features/reviews/commands/submitReview";
import {
  albumReviewStateReducer,
  createAlbumReviewState,
} from "@/features/reviews/hooks/albumReviewStateReducer";
import type { Album, Review } from "@/shared/types";

interface UseAlbumReviewStateOptions {
  album: Album;
  review: Review | null;
}

export interface UseAlbumReviewStateResult {
  rating: number;
  savedRating: number;
  ratingError: string | null;
  isRatingSaving: boolean;
  hasSavedReview: boolean;
  setRating: (rating: number) => void;
}

/**
 * Normalizes unknown failures into the one-line feedback used by the rating card.
 */
function getRatingErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save your rating. Please try again.";
}

/**
 * Owns the committed review snapshot and lightweight inline-rating autosave behavior.
 */
export function useAlbumReviewState({
  album,
  review,
}: UseAlbumReviewStateOptions): UseAlbumReviewStateResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(
    albumReviewStateReducer,
    review,
    createAlbumReviewState,
  );
  const queuedRatingRef = useRef<number | null>(null);
  const isFlushingRatingRef = useRef(false);
  const reviewRef = useRef(review);

  useEffect(() => {
    reviewRef.current = review;
    dispatch({
      type: "SYNC_REVIEW",
      payload: review,
    });
  }, [review]);

  /**
   * Persists one rating update while preserving the currently saved review details.
   */
  async function persistRating(nextRating: number): Promise<void> {
    if (!user?.id) {
      dispatch({
        type: "SET_RATING_ERROR",
        payload: "You must be logged in to save a rating.",
      });
      dispatch({
        type: "SYNC_REVIEW",
        payload: reviewRef.current,
      });
      return;
    }

    dispatch({
      type: "SET_RATING_SAVING",
      payload: true,
    });

    try {
      const committedReview = reviewRef.current;
      const savedReview = await submitReview({
        userId: user.id,
        albumId: album.id,
        existingReviewId: committedReview?.id,
        favoriteTrackId: committedReview?.favorite_track_id ?? "",
        rating: nextRating,
        reviewText: committedReview?.review_text ?? "",
      });

      reviewRef.current = savedReview;
      queryClient.setQueryData(["userReview", user.id, album.id], savedReview);
      dispatch({
        type: "SYNC_REVIEW",
        payload: savedReview,
      });
    } catch (error) {
      dispatch({
        type: "SET_RATING_ERROR",
        payload: getRatingErrorMessage(error),
      });
      dispatch({
        type: "SYNC_REVIEW",
        payload: reviewRef.current,
      });
    } finally {
      dispatch({
        type: "SET_RATING_SAVING",
        payload: false,
      });
    }
  }

  /**
   * Serializes inline rating writes so the last chosen rating wins cleanly.
   */
  async function flushQueuedRating(): Promise<void> {
    if (isFlushingRatingRef.current) {
      return;
    }

    const queuedRating = queuedRatingRef.current;

    if (queuedRating === null) {
      return;
    }

    isFlushingRatingRef.current = true;
    queuedRatingRef.current = null;
    await persistRating(queuedRating);
    isFlushingRatingRef.current = false;

    if (queuedRatingRef.current !== null) {
      await flushQueuedRating();
    }
  }

  /**
   * Updates the visible rating immediately and queues a background save.
   */
  function setRating(nextRating: number): void {
    if (nextRating < 0.5 || nextRating > 5) {
      return;
    }

    if (nextRating === state.currentRating && state.ratingError === null) {
      return;
    }

    dispatch({
      type: "CLEAR_RATING_ERROR",
    });
    dispatch({
      type: "SET_CURRENT_RATING",
      payload: nextRating,
    });
    queuedRatingRef.current = nextRating;
    void flushQueuedRating();
  }

  return {
    rating: state.currentRating,
    savedRating: state.committedReview?.rating ?? 0,
    ratingError: state.ratingError,
    isRatingSaving: state.isRatingSaving,
    hasSavedReview: state.committedReview !== null,
    setRating,
  };
}
