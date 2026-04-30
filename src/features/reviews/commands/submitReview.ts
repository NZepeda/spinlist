import type { Review } from "@/shared/types";
import type {
  ReviewErrorResponse,
  ReviewSuccessResponse,
} from "@/shared/types/api/reviews";

interface SubmitReviewParams {
  releaseGroupId: string;
  existingReviewId?: string;
  favoriteTrackId?: string;
  rating: number;
  reviewText?: string;
  userId: string;
}

/**
 * Submits a review to the database.
 * Handles both creating new reviews and updating existing ones.
 * Automatically upserts the album record when creating a new review.
 *
 * @throws Error if the database operation fails
 */
export async function submitReview(params: SubmitReviewParams): Promise<Review> {
  const {
    releaseGroupId,
    rating,
    reviewText,
    favoriteTrackId,
    existingReviewId,
  } = params;

  const response = await fetch("/api/reviews", {
    body: JSON.stringify({
      releaseGroupId,
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
      (await response.json().catch(() => null)) as ReviewErrorResponse | null;

    throw new Error(errorResponse?.message ?? "Unable to save review");
  }

  const successResponse =
    (await response.json()) as ReviewSuccessResponse;

  if (!successResponse.review) {
    throw new Error("Unable to save review");
  }

  return successResponse.review;
}
