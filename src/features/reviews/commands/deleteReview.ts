interface DeleteReviewParams {
  reviewId: string;
}

interface ReviewApiErrorResponse {
  message: string;
}

/**
 * Deletes a review from the database.
 *
 * @throws Error if the database operation fails
 */
export async function deleteReview({
  reviewId,
}: DeleteReviewParams): Promise<void> {
  const response = await fetch(`/api/reviews?reviewId=${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorResponse =
      (await response.json().catch(() => null)) as ReviewApiErrorResponse | null;

    throw new Error(errorResponse?.message ?? "Unable to delete review");
  }
}
