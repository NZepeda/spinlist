import type { Review } from "@/shared/types";
import type {
  AlbumReviewState,
  AlbumReviewStateAction,
} from "@/features/reviews/types";

/**
 * Returns the persisted review text used as the baseline for composer draft comparisons.
 */
function getReviewText(review: Review | null): string {
  return review?.body ?? "";
}

/**
 * Returns the persisted favorite-track id used as the baseline for composer draft comparisons.
 */
function getFavoriteTrackId(review: Review | null): string {
  return review?.favorite_track ?? "";
}

/**
 * Builds the state snapshot that keeps the primary rating UI aligned with saved review data.
 */
export function createAlbumReviewState(
  review: Review | null,
): AlbumReviewState {
  return {
    committedReview: review,
    currentRating: review?.rating ?? 0,
    draftFavoriteTrackId: getFavoriteTrackId(review),
    draftReviewText: getReviewText(review),
    isComposerSaving: false,
    isRatingSaving: false,
    composerError: null,
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
    case "CLEAR_COMPOSER_ERROR":
      return {
        ...state,
        composerError: null,
      };
    case "CLEAR_RATING_ERROR":
      return {
        ...state,
        ratingError: null,
      };
    case "SAVE_COMPOSER_SUCCESS":
      return {
        ...state,
        committedReview: action.payload,
        currentRating: action.payload.rating,
        draftFavoriteTrackId: getFavoriteTrackId(action.payload),
        draftReviewText: getReviewText(action.payload),
        isComposerSaving: false,
        composerError: null,
        ratingError: null,
      };
    case "SET_COMPOSER_ERROR":
      return {
        ...state,
        composerError: action.payload,
      };
    case "SET_COMPOSER_SAVING":
      return {
        ...state,
        isComposerSaving: action.payload,
      };
    case "SET_CURRENT_RATING":
      return {
        ...state,
        currentRating: action.payload,
      };
    case "SET_DRAFT_FAVORITE_TRACK_ID":
      return {
        ...state,
        draftFavoriteTrackId: action.payload,
      };
    case "SET_DRAFT_REVIEW_TEXT":
      return {
        ...state,
        draftReviewText: action.payload,
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
        draftFavoriteTrackId:
          state.draftFavoriteTrackId ===
          getFavoriteTrackId(state.committedReview)
            ? getFavoriteTrackId(action.payload)
            : state.draftFavoriteTrackId,
        draftReviewText:
          state.draftReviewText === getReviewText(state.committedReview)
            ? getReviewText(action.payload)
            : state.draftReviewText,
        ratingError: null,
      };
    default:
      return state;
  }
}
