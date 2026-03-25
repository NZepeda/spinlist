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
  reviewText: string;
  rating: number;
  savedRating: number;
  composerError: string | null;
  ratingError: string | null;
  isComposerDirty: boolean;
  isComposerSaving: boolean;
  isRatingSaving: boolean;
  hasSavedReview: boolean;
  hasSavedReviewText: boolean;
  saveComposer: () => Promise<boolean>;
  setReviewText: (reviewText: string) => void;
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
 * Normalizes review-composer failures into brief inline feedback.
 */
function getComposerErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save your review details. Please try again.";
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

  /**
   * Updates the in-session review-text draft without publishing it.
   */
  function setReviewText(nextReviewText: string): void {
    dispatch({
      type: "CLEAR_COMPOSER_ERROR",
    });
    dispatch({
      type: "SET_DRAFT_REVIEW_TEXT",
      payload: nextReviewText,
    });
  }

  /**
   * Persists the current composer draft while keeping rating autosave and draft editing separate.
   */
  async function saveComposer(): Promise<boolean> {
    if (!user?.id) {
      dispatch({
        type: "SET_COMPOSER_ERROR",
        payload: "You must be logged in to save review details.",
      });
      return false;
    }

    if (state.isRatingSaving) {
      dispatch({
        type: "SET_COMPOSER_ERROR",
        payload: "Wait for your rating to finish saving before saving details.",
      });
      return false;
    }

    if (state.currentRating < 0.5) {
      dispatch({
        type: "SET_COMPOSER_ERROR",
        payload: "Set a rating before saving review details.",
      });
      return false;
    }

    if (state.draftReviewText.length > 2000) {
      dispatch({
        type: "SET_COMPOSER_ERROR",
        payload: "Review text must be 2000 characters or less.",
      });
      return false;
    }

    dispatch({
      type: "SET_COMPOSER_SAVING",
      payload: true,
    });
    dispatch({
      type: "CLEAR_COMPOSER_ERROR",
    });

    try {
      const committedReview = reviewRef.current;
      const savedReview = await submitReview({
        userId: user.id,
        albumId: album.id,
        existingReviewId: committedReview?.id,
        favoriteTrackId: committedReview?.favorite_track_id ?? "",
        rating: state.currentRating,
        reviewText: state.draftReviewText,
      });

      reviewRef.current = savedReview;
      queryClient.setQueryData(["userReview", user.id, album.id], savedReview);
      dispatch({
        type: "SAVE_COMPOSER_SUCCESS",
        payload: savedReview,
      });
      return true;
    } catch (error) {
      dispatch({
        type: "SET_COMPOSER_ERROR",
        payload: getComposerErrorMessage(error),
      });
      dispatch({
        type: "SET_COMPOSER_SAVING",
        payload: false,
      });
      return false;
    }
  }

  const savedReviewText = state.committedReview?.review_text ?? "";

  return {
    reviewText: state.draftReviewText,
    rating: state.currentRating,
    savedRating: state.committedReview?.rating ?? 0,
    composerError: state.composerError,
    ratingError: state.ratingError,
    isComposerDirty: state.draftReviewText !== savedReviewText,
    isComposerSaving: state.isComposerSaving,
    isRatingSaving: state.isRatingSaving,
    hasSavedReview: state.committedReview !== null,
    hasSavedReviewText: savedReviewText.trim().length > 0,
    saveComposer,
    setReviewText,
    setRating,
  };
}
