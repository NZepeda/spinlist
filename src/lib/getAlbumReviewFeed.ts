import { createClient } from "./supabase/server";
import type { Album } from "@/lib/types";

interface ReviewFeedProfileRow {
  username: string;
}

interface ReviewFeedRow {
  created_at: string;
  favorite_track_id: string | null;
  id: string;
  profiles: ReviewFeedProfileRow | ReviewFeedProfileRow[] | null;
  rating: number;
  review_text: string | null;
}

export interface AlbumReviewFeedItem {
  createdAt: string;
  favoriteTrackId: string | null;
  favoriteTrackName: string | null;
  id: string;
  rating: number;
  reviewText: string;
  username: string;
}

/**
 * Extracts a username from the joined profile relationship returned by Supabase.
 */
function getUsername(
  profile: ReviewFeedProfileRow | ReviewFeedProfileRow[] | null,
): string {
  if (Array.isArray(profile)) {
    return profile[0]?.username ?? "Anonymous";
  }

  return profile?.username ?? "Anonymous";
}

/**
 * Loads the recent written reviews for the album page feed.
 */
export async function getAlbumReviewFeed(
  album: Album,
): Promise<AlbumReviewFeedItem[]> {
  const supabase = await createClient();
  const trackMap = new Map(album.tracks.map((track) => [track.id, track.name]));
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating, review_text, favorite_track_id, created_at, profiles(username)")
    .eq("album_id", album.id)
    .not("review_text", "is", null)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !reviews) {
    return [];
  }

  const typedReviews = reviews as ReviewFeedRow[];

  return typedReviews.flatMap((review) => {
    if (!review.review_text) {
      return [];
    }

    return {
      createdAt: review.created_at,
      favoriteTrackId: review.favorite_track_id,
      favoriteTrackName: review.favorite_track_id
        ? trackMap.get(review.favorite_track_id) ?? null
        : null,
      id: review.id,
      rating: review.rating,
      reviewText: review.review_text,
      username: getUsername(review.profiles),
    };
  });
}
