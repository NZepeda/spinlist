import type { Review } from "@/shared/types";

export interface AlbumReviewState {
  committedReview: Review | null;
  currentRating: number;
  isRatingSaving: boolean;
  ratingError: string | null;
}

export type AlbumReviewStateAction =
  | { type: "CLEAR_RATING_ERROR" }
  | { type: "SET_CURRENT_RATING"; payload: number }
  | { type: "SET_RATING_ERROR"; payload: string }
  | { type: "SET_RATING_SAVING"; payload: boolean }
  | { type: "SYNC_REVIEW"; payload: Review | null };

/**
 * Builds the state snapshot that keeps the primary rating UI aligned with saved review data.
 */
export function createAlbumReviewState(
  review: Review | null,
): AlbumReviewState {
  return {
    committedReview: review,
    currentRating: review?.rating ?? 0,
    isRatingSaving: false,
    ratingError: null,
  };
}

/**
 * Updates rating-specific state without leaking persistence details into the UI components.
 */
export function albumReviewStateReducer(
  state: AlbumReviewState,
  action: AlbumReviewStateAction,
): AlbumReviewState {
  switch (action.type) {
    case "CLEAR_RATING_ERROR":
      return {
        ...state,
        ratingError: null,
      };
    case "SET_CURRENT_RATING":
      return {
        ...state,
        currentRating: action.payload,
      };
    case "SET_RATING_ERROR":
      return {
        ...state,
        ratingError: action.payload,
      };
    case "SET_RATING_SAVING":
      return {
        ...state,
        isRatingSaving: action.payload,
      };
    case "SYNC_REVIEW":
      return {
        ...state,
        committedReview: action.payload,
        currentRating: action.payload?.rating ?? 0,
        ratingError: null,
      };
    default:
      return state;
  }
}
