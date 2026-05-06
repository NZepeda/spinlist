import type { ReviewRow } from "@/server/database";

/**
 * All possible error outcomes when saving or deleting a review.
 */
export type ReviewErrorCode =
  | "EMAIL_CONFIRMATION_REQUIRED"
  | "INVALID_FAVORITE_TRACK"
  | "INVALID_REQUEST"
  | "ALBUM_NOT_FOUND"
  | "SAVE_FAILED"
  | "UNAUTHORIZED";

/**
 * The shape of the request body sent to the reviews API endpoint.
 */
export interface ReviewRequestBody {
  albumId: string;
  existingReviewId?: string;
  favoriteTrackId?: string;
  rating: number;
  reviewText?: string;
}

/**
 * The response shape returned when a review API request fails.
 */
export interface ReviewErrorResponse {
  code: ReviewErrorCode;
  eventId?: string;
  message: string;
  requestId?: string;
}

/**
 * The response shape returned when a review is successfully saved or deleted.
 */
export interface ReviewSuccessResponse {
  ok: true;
  review?: ReviewRow;
}
