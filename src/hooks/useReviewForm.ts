"use client";

import { useReducer, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Album } from "@/lib/types/album";
import { Review } from "@/lib/types/review";
import {
  reviewFormInitialState,
  reviewFormReducer,
  ReviewFormState,
} from "./reviewFormReducer";
import { submitReview } from "@/lib/mutations/submitReview";
import { deleteReview } from "@/lib/mutations/deleteReview";

interface UseReviewFormOptions {
  album: Pick<Album, "id" | "name" | "artist" | "image" | "release_date">;
  existingReview?: Review | null;
}

/**
 * Validates the review form and returns any errors found.
 * Returns an empty object if the form is valid.
 */
function getValidationErrors(
  rating: number,
  reviewText: string,
): ReviewFormState["errors"] {
  const errors: ReviewFormState["errors"] = {};

  if (rating < 0.5 || rating > 5) {
    errors.rating = "Please select a rating between 0.5 and 5 stars";
  }

  if (reviewText.length > 2000) {
    errors.reviewText = "Review text must be 2000 characters or less";
  }

  return errors;
}

/**
 * Hook for managing review form state and logic.
 * Handles creating, updating, and deleting reviews with validation.
 */
export function useReviewForm({ album, existingReview }: UseReviewFormOptions) {
  const initialState = existingReview
    ? {
        rating: existingReview.rating,
        reviewText: existingReview.review_text || "",
        favoriteTrackId: existingReview.favorite_track_id || "",
        errors: {},
      }
    : reviewFormInitialState;

  const [state, dispatch] = useReducer(reviewFormReducer, initialState);
  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(existingReview);

  const errors = useMemo(
    () => getValidationErrors(state.rating, state.reviewText),
    [state.rating, state.reviewText],
  );

  const isFormValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("You must be logged in to submit a review");
      }

      await submitReview({
        supabase,
        userId: user.id,
        album,
        rating: state.rating,
        reviewText: state.reviewText || null,
        favoriteTrackId: state.favoriteTrackId || null,
        existingReviewId: existingReview?.id,
      });
    },
    onSuccess: async () => {
      if (user?.id) {
        // Once the review is submitted, invalidate the userReview query to refetch the latest data.
        await queryClient.invalidateQueries({
          queryKey: ["userReview", user.id, album.id],
        });
      }
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      dispatch({
        type: "SET_ERROR",
        field: "general",
        message: "Failed to submit review. Please try again.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!existingReview) {
        throw new Error("No review to delete");
      }

      await deleteReview({
        supabase,
        reviewId: existingReview.id,
      });
    },
    onSuccess: async () => {
      dispatch({ type: "RESET" });

      if (user?.id) {
        // Once the review is deleted, invalidate the userReview query to refetch the latest data.
        await queryClient.invalidateQueries({
          queryKey: ["userReview", user.id, album.id],
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting review:", error);
      dispatch({
        type: "SET_ERROR",
        field: "general",
        message: "Failed to delete review. Please try again.",
      });
    },
  });

  const setRating = (rating: number) => {
    dispatch({ type: "SET_RATING", payload: rating });
  };

  const setReviewText = (text: string) => {
    dispatch({ type: "SET_REVIEW_TEXT", payload: text });
  };

  const setFavoriteTrackId = (trackId: string) => {
    dispatch({ type: "SET_FAVORITE_TRACK", payload: trackId });
  };

  const handleSubmit = () => {
    if (!user?.id) {
      dispatch({
        type: "SET_ERROR",
        field: "general",
        message: "You must be logged in to submit a review",
      });
      return;
    }

    const errors = getValidationErrors(state.rating, state.reviewText);

    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      return;
    }

    dispatch({ type: "CLEAR_ERRORS" });
    submitMutation.mutate();
  };

  const handleDelete = () => {
    if (!user?.id || !existingReview) {
      return;
    }

    deleteMutation.mutate();
  };

  return {
    rating: state.rating,
    reviewText: state.reviewText,
    favoriteTrackId: state.favoriteTrackId,
    errors: state.errors,
    isLoading: submitMutation.isPending || deleteMutation.isPending,
    isFormValid,
    setRating,
    setReviewText,
    setFavoriteTrackId,
    handleSubmit,
    handleDelete,
    isEditMode,
  };
}
