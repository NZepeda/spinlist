interface DeleteReviewParams {
  reviewId: string;
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
    throw new Error("Unable to delete review");
  }
}
