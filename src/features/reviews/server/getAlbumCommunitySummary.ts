import { createClient } from "@/server/supabase/server";
import type { Album, AlbumTrack } from "@/shared/types";

interface ReviewSummaryRow {
  favorite_track_id: string | null;
  rating: number;
}

export interface AlbumCommunityRatingBucket {
  rating: number;
  count: number;
}

export interface AlbumCommunityFavoriteTrack {
  count: number;
  percentage: number;
  trackId: string;
  trackName: string;
}

export interface AlbumCommunitySummary {
  averageRating: number | null;
  availability: "available" | "unavailable";
  favoriteTracks: AlbumCommunityFavoriteTrack[];
  ratingHistogram: AlbumCommunityRatingBucket[];
  reviewCount: number;
  standoutTrack: AlbumCommunityFavoriteTrack | null;
}

/**
 * Builds the rating histogram buckets used in the community summary.
 */
function buildRatingHistogram(
  reviews: ReviewSummaryRow[],
): AlbumCommunityRatingBucket[] {
  const histogram = new Map<number, number>();

  for (let rating = 0.5; rating <= 5; rating += 0.5) {
    histogram.set(rating, 0);
  }

  for (const review of reviews) {
    const currentCount = histogram.get(review.rating) ?? 0;
    histogram.set(review.rating, currentCount + 1);
  }

  return Array.from(histogram.entries()).map(([rating, count]) => ({
    rating,
    count,
  }));
}

/**
 * Builds favorite-track counts and percentages from the album's reviews.
 */
function buildFavoriteTracks(
  albumTracks: AlbumTrack[],
  reviews: ReviewSummaryRow[],
): AlbumCommunityFavoriteTrack[] {
  const trackMap = new Map(albumTracks.map((track) => [track.id, track.name]));
  const favoriteTrackCounts = new Map<string, number>();
  let totalFavoriteSelections = 0;

  for (const review of reviews) {
    if (!review.favorite_track_id) {
      continue;
    }

    const trackName = trackMap.get(review.favorite_track_id);

    if (!trackName) {
      continue;
    }

    totalFavoriteSelections += 1;

    const currentCount = favoriteTrackCounts.get(review.favorite_track_id) ?? 0;
    favoriteTrackCounts.set(review.favorite_track_id, currentCount + 1);
  }

  return Array.from(favoriteTrackCounts.entries())
    .map(([trackId, count]) => ({
      count,
      percentage:
        totalFavoriteSelections > 0
          ? Math.round((count / totalFavoriteSelections) * 100)
          : 0,
      trackId,
      trackName: trackMap.get(trackId) ?? "Unknown track",
    }))
    .sort((firstTrack, secondTrack) => secondTrack.count - firstTrack.count);
}

/**
 * Builds the album community summary from the album record and review rows.
 */
export function buildAlbumCommunitySummary(
  album: Album,
  reviews: ReviewSummaryRow[],
): AlbumCommunitySummary {
  const favoriteTracks = buildFavoriteTracks(album.tracks, reviews);

  return {
    averageRating: album.avg_rating,
    availability: "available",
    favoriteTracks,
    ratingHistogram: buildRatingHistogram(reviews),
    reviewCount: album.review_count ?? reviews.length,
    standoutTrack: favoriteTracks[0] ?? null,
  };
}

/**
 * Loads the community summary for an album from the server.
 */
export async function getAlbumCommunitySummary(
  album: Album,
): Promise<AlbumCommunitySummary> {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("rating, favorite_track_id")
    .eq("album_id", album.id);

  if (error || !reviews) {
    // Preserve the known album-level stats while making the query failure explicit.
    return {
      averageRating: album.avg_rating,
      availability: "unavailable",
      favoriteTracks: [],
      ratingHistogram: buildRatingHistogram([]),
      reviewCount: album.review_count ?? 0,
      standoutTrack: null,
    };
  }

  return buildAlbumCommunitySummary(album, reviews);
}
