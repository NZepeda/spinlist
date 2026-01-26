import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";

interface DeleteReviewParams {
  supabase: SupabaseClient<Database>;
  reviewId: string;
}

/**
 * Deletes a review from the database.
 *
 * @throws Error if the database operation fails
 */
export async function deleteReview({
  supabase,
  reviewId,
}: DeleteReviewParams): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    throw error;
  }
}
