import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";
import { Album, imagesToJson } from "@/lib/types/album";

interface SubmitReviewParams {
  supabase: SupabaseClient<Database>;
  userId: string;
  album: Album;
  rating: number;
  reviewText: string | null;
  favoriteTrackId: string | null;
  existingReviewId?: string;
}

/**
 * Upserts an album record and returns the database ID.
 * Creates the album if it doesn't exist, or returns the existing ID.
 */
async function upsertAlbum(
  supabase: SupabaseClient<Database>,
  album: Album,
): Promise<string> {
  const { data, error } = await supabase
    .from("albums")
    .upsert(
      {
        spotify_id: album.id,
        title: album.name,
        artist: album.artist,
        images: imagesToJson(album.images),
        release_date: album.release_date,
        tracks: album.tracks,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "spotify_id" },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

/**
 * Submits a review to the database.
 * Handles both creating new reviews and updating existing ones.
 * Automatically upserts the album record when creating a new review.
 *
 * @throws Error if the database operation fails
 */
export async function submitReview({
  supabase,
  userId,
  album,
  rating,
  reviewText,
  favoriteTrackId,
  existingReviewId,
}: SubmitReviewParams): Promise<void> {
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
    // Upsert album to get the database ID
    const albumId = await upsertAlbum(supabase, album);

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
