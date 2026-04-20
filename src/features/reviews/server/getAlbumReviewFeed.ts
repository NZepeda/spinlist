import { createClient } from "@/server/supabase/server";
import { captureException } from "@/monitoring/captureException";
import { startSpan } from "@/monitoring/startSpan";
import type { Album } from "@/shared/types";
import type { AlbumReviewFeedItem } from "@/features/reviews/types";

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

/**
 * Keeps reviewer names readable when joined profile data arrives in different shapes.
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
 * Loads recent written reviews while falling back cleanly if that data is unavailable.
 */
export async function getAlbumReviewFeed(
  album: Album,
): Promise<AlbumReviewFeedItem[]> {
  const supabase = await createClient();
  const trackMap = new Map(album.tracks.map((track) => [track.id, track.name]));
  const { data: reviews, error } = await startSpan(
    {
      name: "page.album.review_feed",
      op: "db.supabase",
    },
    async () =>
      await supabase
        .from("reviews")
        .select("id, rating, review_text, favorite_track_id, created_at, profiles(username)")
        .eq("album_id", album.id)
        .not("review_text", "is", null)
        .order("created_at", { ascending: false })
        .limit(12),
  );

  if (error || !reviews) {
    if (error) {
      captureException(error, {
        context: {
          albumId: album.id,
          path: `/album/${album.slug}`,
        },
        tags: {
          dependency: "supabase",
          pageType: "album",
          supabaseOperation: "page.album.review_feed",
        },
      });
    }

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
