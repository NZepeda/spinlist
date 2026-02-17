import { createClient } from "../supabase/client";

interface SubmitReviewParams {
  userId: string;
  albumId: string;
  rating: number;
  reviewText?: string;
  favoriteTrackId?: string;
  existingReviewId?: string;
}

/**
 * Submits a review to the database.
 * Handles both creating new reviews and updating existing ones.
 * Automatically upserts the album record when creating a new review.
 *
 * @throws Error if the database operation fails
 */
export async function submitReview({
  albumId,
  rating,
  reviewText,
  favoriteTrackId,
  existingReviewId,
  userId,
}: SubmitReviewParams): Promise<void> {
  const supabase = createClient();

  if (existingReviewId) {
    const { error } = await supabase
      .from("reviews")
      .update({
        rating,
        review_text: reviewText,
        favorite_track_id: favoriteTrackId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingReviewId);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("reviews").insert({
      user_id: userId,
      album_id: albumId,
      rating,
      review_text: reviewText,
      favorite_track_id: favoriteTrackId,
    });

    if (error) {
      throw error;
    }
  }
}
