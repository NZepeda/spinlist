"use client";

import { useEffect, useMemo, useReducer, useRef, type Dispatch } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Album, Review } from "@/shared/types";
import {
  reviewFormInitialState,
  reviewFormReducer,
  type ReviewFormAction,
  ReviewFormState,
} from "./reviewFormReducer";
import { submitReview } from "@/features/reviews/commands/submitReview";
import { deleteReview } from "@/features/reviews/commands/deleteReview";

interface UseReviewFormOptions {
  album: Album;
  existingReview?: Review | null;
}

interface ReviewDraftSnapshot {
  rating: number;
  reviewText: string;
  favoriteTrackId: string;
}

const REVIEW_DRAFT_STORAGE_KEY_PREFIX = "review-draft";

interface UseReviewDraftStateOptions {
  albumId: string;
  existingReview?: Review | null;
  userId: string | null;
}

interface UseReviewDraftStateResult {
  dispatch: Dispatch<ReviewFormAction>;
  draftStorageKey: string | null;
  isDirty: boolean;
  isFormValid: boolean;
  state: ReviewFormState;
}

interface UseReviewFormMutationsOptions {
  album: Album;
  dispatch: Dispatch<ReviewFormAction>;
  draftStorageKey: string | null;
  existingReview?: Review | null;
  queryClient: ReturnType<typeof useQueryClient>;
  state: ReviewFormState;
  userId: string | null;
}

export interface UseReviewFormResult {
  rating: number;
  reviewText: string;
  favoriteTrackId: string;
  errors: ReviewFormState["errors"];
  isLoading: boolean;
  isDirty: boolean;
  isFormValid: boolean;
  setRating: (rating: number) => void;
  setReviewText: (text: string) => void;
  setFavoriteTrackId: (trackId: string) => void;
  handleSubmit: () => void;
  handleDelete: () => void;
  isEditMode: boolean;
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
 * Returns the canonical form values for an existing review or a new draft.
 */
function getBaseDraftSnapshot(
  existingReview?: Review | null,
): ReviewDraftSnapshot {
  if (!existingReview) {
    return {
      rating: reviewFormInitialState.rating,
      reviewText: reviewFormInitialState.reviewText,
      favoriteTrackId: reviewFormInitialState.favoriteTrackId,
    };
  }

  return {
    rating: existingReview.rating,
    reviewText: existingReview.review_text || "",
    favoriteTrackId: existingReview.favorite_track_id || "",
  };
}

/**
 * Builds the localStorage key used to persist an unsaved review draft.
 */
function getDraftStorageKey(userId: string, albumId: string): string {
  return `${REVIEW_DRAFT_STORAGE_KEY_PREFIX}:${userId}:${albumId}`;
}

/**
 * Returns whether two draft snapshots represent the same draft state.
 */
function areDraftSnapshotsEqual(
  firstDraft: ReviewDraftSnapshot,
  secondDraft: ReviewDraftSnapshot,
): boolean {
  return (
    firstDraft.rating === secondDraft.rating &&
    firstDraft.reviewText === secondDraft.reviewText &&
    firstDraft.favoriteTrackId === secondDraft.favoriteTrackId
  );
}

/**
 * Safely parses a locally persisted review draft snapshot.
 */
function parseDraftSnapshot(rawDraft: string | null): ReviewDraftSnapshot | null {
  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as unknown;

    if (
      parsedDraft === null ||
      typeof parsedDraft !== "object" ||
      Array.isArray(parsedDraft)
    ) {
      return null;
    }

    const record = parsedDraft as Record<string, unknown>;

    if (typeof record.rating !== "number") {
      return null;
    }

    if (typeof record.reviewText !== "string") {
      return null;
    }

    if (typeof record.favoriteTrackId !== "string") {
      return null;
    }

    return {
      rating: record.rating,
      reviewText: record.reviewText,
      favoriteTrackId: record.favoriteTrackId,
    };
  } catch {
    return null;
  }
}

/**
 * Keeps the review draft state hydrated from the saved review and synced with
 * localStorage while the user edits.
 */
function useReviewDraftState({
  albumId,
  existingReview,
  userId,
}: UseReviewDraftStateOptions): UseReviewDraftStateResult {
  const baseDraftSnapshot = useMemo(
    () => getBaseDraftSnapshot(existingReview),
    [existingReview],
  );
  const [state, dispatch] = useReducer(reviewFormReducer, {
    ...baseDraftSnapshot,
    errors: {},
  });
  const hasHydratedDraftRef = useRef(false);
  const draftStorageKey = userId ? getDraftStorageKey(userId, albumId) : null;

  // Keep reducer state aligned with the latest saved review coming from React Query.
  useEffect(() => {
    dispatch({
      type: "INITIALIZE",
      payload: baseDraftSnapshot,
    });
  }, [baseDraftSnapshot]);

  // Restore any unsaved local draft once per album/user pair on first mount.
  useEffect(() => {
    if (!draftStorageKey || hasHydratedDraftRef.current) {
      return;
    }

    const storedDraft = parseDraftSnapshot(
      window.localStorage.getItem(draftStorageKey),
    );

    if (storedDraft) {
      dispatch({
        type: "INITIALIZE",
        payload: storedDraft,
      });
    }

    hasHydratedDraftRef.current = true;
  }, [draftStorageKey]);

  const errors = useMemo(
    () => getValidationErrors(state.rating, state.reviewText),
    [state.rating, state.reviewText],
  );
  const isFormValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const draftSnapshot = useMemo(
    () => ({
      rating: state.rating,
      reviewText: state.reviewText,
      favoriteTrackId: state.favoriteTrackId,
    }),
    [state.favoriteTrackId, state.rating, state.reviewText],
  );
  const isDirty = useMemo(
    () => !areDraftSnapshotsEqual(draftSnapshot, baseDraftSnapshot),
    [baseDraftSnapshot, draftSnapshot],
  );

  // Persist only dirty drafts so saved or reset forms do not leave stale local data behind.
  useEffect(() => {
    if (!draftStorageKey || !hasHydratedDraftRef.current) {
      return;
    }

    if (areDraftSnapshotsEqual(draftSnapshot, baseDraftSnapshot)) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draftSnapshot));
  }, [baseDraftSnapshot, draftSnapshot, draftStorageKey]);

  return {
    dispatch,
    draftStorageKey,
    isDirty,
    isFormValid,
    state,
  };
}

/**
 * Creates the submit and delete handlers for the review form.
 */
function useReviewFormMutations({
  album,
  dispatch,
  draftStorageKey,
  existingReview,
  queryClient,
  state,
  userId,
}: UseReviewFormMutationsOptions) {
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("You must be logged in to submit a review");
      }

      await submitReview({
        userId,
        albumId: album.id,
        rating: state.rating,
        reviewText: state.reviewText,
        favoriteTrackId: state.favoriteTrackId,
        existingReviewId: existingReview?.id,
      });
    },
    onSuccess: async () => {
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["userReview", userId, album.id],
        });
      }

      if (draftStorageKey) {
        window.localStorage.removeItem(draftStorageKey);
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again.";

      dispatch({
        type: "SET_ERROR",
        field: "general",
        message: errorMessage,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!existingReview) {
        throw new Error("No review to delete");
      }

      await deleteReview({
        reviewId: existingReview.id,
      });
    },
    onSuccess: async () => {
      dispatch({ type: "RESET" });

      if (draftStorageKey) {
        window.localStorage.removeItem(draftStorageKey);
      }

      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["userReview", userId, album.id],
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

  const handleSubmit = () => {
    if (!userId) {
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
    if (!userId || !existingReview) {
      return;
    }

    deleteMutation.mutate();
  };

  return {
    handleDelete,
    handleSubmit,
    isLoading: submitMutation.isPending || deleteMutation.isPending,
  };
}

/**
 * Hook for managing review form state and logic.
 * Handles draft-first album logging with local draft persistence, explicit saves,
 * and review deletion for the current user.
 */
export function useReviewForm({
  album,
  existingReview,
}: UseReviewFormOptions): UseReviewFormResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const isEditMode = Boolean(existingReview);
  const { dispatch, draftStorageKey, isDirty, isFormValid, state } =
    useReviewDraftState({
    albumId: album.id,
    existingReview,
    userId,
  });
  const { handleDelete, handleSubmit, isLoading } = useReviewFormMutations({
    album,
    dispatch,
    draftStorageKey,
    existingReview,
    queryClient,
    state,
    userId,
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

  return {
    rating: state.rating,
    reviewText: state.reviewText,
    favoriteTrackId: state.favoriteTrackId,
    errors: state.errors,
    isLoading,
    isDirty,
    isFormValid,
    setRating,
    setReviewText,
    setFavoriteTrackId,
    handleSubmit,
    handleDelete,
    isEditMode,
  };
}
