import type { Review } from "@/shared/types";

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

/**
 * A single review entry shown in the album review feed, with profile and track details resolved.
 */
export interface AlbumReviewFeedItem {
  createdAt: string;
  favoriteTrackId: string | null;
  favoriteTrackName: string | null;
  id: string;
  rating: number;
  reviewText: string;
  username: string;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * The full state managed by the album review reducer.
 */
export interface AlbumReviewState {
  committedReview: Review | null;
  composerError: string | null;
  currentRating: number;
  draftFavoriteTrackId: string;
  draftReviewText: string;
  isComposerSaving: boolean;
  isRatingSaving: boolean;
  ratingError: string | null;
}

/**
 * All actions that can update the album review reducer state.
 */
export type AlbumReviewStateAction =
  | { type: "CLEAR_COMPOSER_ERROR" }
  | { type: "CLEAR_RATING_ERROR" }
  | { type: "SAVE_COMPOSER_SUCCESS"; payload: Review }
  | { type: "SET_COMPOSER_ERROR"; payload: string }
  | { type: "SET_COMPOSER_SAVING"; payload: boolean }
  | { type: "SET_CURRENT_RATING"; payload: number }
  | { type: "SET_DRAFT_FAVORITE_TRACK_ID"; payload: string }
  | { type: "SET_DRAFT_REVIEW_TEXT"; payload: string }
  | { type: "SET_RATING_ERROR"; payload: string }
  | { type: "SET_RATING_SAVING"; payload: boolean }
  | { type: "SYNC_REVIEW"; payload: Review | null };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * The public interface returned by useAlbumReviewState, consumed by album rating and composer components.
 */
export interface UseAlbumReviewStateResult {
  composerError: string | null;
  favoriteTrackId: string;
  hasSavedFavoriteTrack: boolean;
  hasSavedReview: boolean;
  hasSavedReviewText: boolean;
  isComposerDirty: boolean;
  isComposerSaving: boolean;
  isRatingSaving: boolean;
  rating: number;
  ratingError: string | null;
  reviewText: string;
  saveComposer: () => Promise<boolean>;
  savedFavoriteTrackId: string;
  savedRating: number;
  savedReviewText: string;
  setFavoriteTrackId: (trackId: string) => void;
  setRating: (rating: number) => void;
  setReviewText: (reviewText: string) => void;
}
