import type { Review } from "@/shared/types";

interface SubmitReviewParams {
  userId: string;
  albumId: string;
  rating: number;
  reviewText?: string;
  favoriteTrackId?: string;
  existingReviewId?: string;
}

interface ReviewApiErrorResponse {
  code:
    | "INVALID_REQUEST"
    | "UNAUTHORIZED"
    | "EMAIL_CONFIRMATION_REQUIRED"
    | "ALBUM_NOT_FOUND"
    | "INVALID_FAVORITE_TRACK"
    | "SAVE_FAILED";
  message: string;
}

interface ReviewApiSuccessResponse {
  ok: true;
  review: Review;
}

/**
 * Submits a review to the database.
 * Handles both creating new reviews and updating existing ones.
 * Automatically upserts the album record when creating a new review.
 *
 * @throws Error if the database operation fails
 */
export async function submitReview(params: SubmitReviewParams): Promise<Review> {
  const { albumId, rating, reviewText, favoriteTrackId, existingReviewId } =
    params;

  const response = await fetch("/api/reviews", {
    body: JSON.stringify({
      albumId,
      existingReviewId,
      favoriteTrackId,
      rating,
      reviewText,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorResponse =
      (await response.json().catch(() => null)) as ReviewApiErrorResponse | null;

    throw new Error(errorResponse?.message ?? "Unable to save review");
  }

  const successResponse =
    (await response.json()) as ReviewApiSuccessResponse;

  return successResponse.review;
}
