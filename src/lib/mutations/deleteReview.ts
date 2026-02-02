import { createClient } from "../supabase/client";

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
  const supabase = createClient();

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    throw error;
  }
}
