import { createClient } from "@/server/supabase/server";
import { captureException } from "@/monitoring/captureException";
import { startSpan } from "@/monitoring/startSpan";
import type { AlbumRecord } from "@/shared/types";
import type { AlbumReviewFeedItem } from "@/features/reviews/types";

interface ReviewFeedUserRow {
  username: string;
}

interface ReviewFeedRow {
  body: string | null;
  created_at: string;
  favorite_track: string | null;
  id: string;
  rating: number;
  users: ReviewFeedUserRow | ReviewFeedUserRow[] | null;
}

/**
 * Keeps reviewer names readable when joined user data arrives in different shapes.
 */
function getUsername(
  user: ReviewFeedUserRow | ReviewFeedUserRow[] | null,
): string {
  if (Array.isArray(user)) {
    return user[0]?.username ?? "Anonymous";
  }

  return user?.username ?? "Anonymous";
}

/**
 * Loads recent written reviews for an album record while falling back cleanly if that data is unavailable.
 */
export async function getAlbumReviewFeed(
  album: AlbumRecord,
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
        .select("id, rating, body, favorite_track, created_at, users(username)")
        .eq("album_id", album.id)
        .not("body", "is", null)
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
    if (!review.body) {
      return [];
    }

    return {
      createdAt: review.created_at,
      favoriteTrackId: review.favorite_track,
      favoriteTrackName: review.favorite_track
        ? trackMap.get(review.favorite_track) ?? null
        : null,
      id: review.id,
      rating: review.rating,
      reviewText: review.body,
      username: getUsername(review.users),
    };
  });
}
