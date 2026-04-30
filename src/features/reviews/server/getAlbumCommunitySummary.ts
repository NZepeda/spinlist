import { createClient } from "@/server/supabase/server";
import { captureException } from "@/monitoring/captureException";
import { startSpan } from "@/monitoring/startSpan";
import type { Album, AlbumTrack } from "@/shared/types";
import type {
  AlbumCommunityFavoriteTrack,
  AlbumCommunityRatingBucket,
  AlbumCommunitySummary,
} from "@/features/reviews/types";

interface ReviewSummaryRow {
  favorite_track: string | null;
  rating: number;
}

/**
 * Keeps the community chart consistent even when some ratings have not been used yet.
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
 * Summarizes favorite-song picks so standout tracks can be identified from listener activity.
 */
function buildFavoriteTracks(
  albumTracks: AlbumTrack[],
  reviews: ReviewSummaryRow[],
): AlbumCommunityFavoriteTrack[] {
  const trackMap = new Map(albumTracks.map((track) => [track.id, track.name]));
  const favoriteTrackCounts = new Map<string, number>();
  let totalFavoriteSelections = 0;

  for (const review of reviews) {
    if (!review.favorite_track) {
      continue;
    }

    const trackName = trackMap.get(review.favorite_track);

    if (!trackName) {
      continue;
    }

    totalFavoriteSelections += 1;

    const currentCount = favoriteTrackCounts.get(review.favorite_track) ?? 0;
    favoriteTrackCounts.set(review.favorite_track, currentCount + 1);
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
 * Combines release-group stats and review rows into a single community summary.
 */
export function buildAlbumCommunitySummary(
  releaseGroup: Album,
  reviews: ReviewSummaryRow[],
): AlbumCommunitySummary {
  const favoriteTracks = buildFavoriteTracks(releaseGroup.tracks, reviews);

  return {
    averageRating: releaseGroup.avg_rating,
    availability: "available",
    favoriteTracks,
    ratingHistogram: buildRatingHistogram(reviews),
    reviewCount: releaseGroup.review_count ?? reviews.length,
    standoutTrack: favoriteTracks[0] ?? null,
  };
}

/**
 * Loads community review aggregates for a release group while preserving a graceful fallback when review data is unavailable.
 */
export async function getAlbumCommunitySummary(
  releaseGroup: Album,
): Promise<AlbumCommunitySummary> {
  const supabase = await createClient();
  const { data: reviews, error } = await startSpan(
    {
      name: "page.album.community_summary",
      op: "db.supabase",
    },
    async () =>
      await supabase
        .from("reviews")
        .select("rating, favorite_track")
        .eq("release_group_id", releaseGroup.id),
  );

  if (error || !reviews) {
    if (error) {
      captureException(error, {
        context: {
          releaseGroupId: releaseGroup.id,
          path: `/album/${releaseGroup.slug}`,
        },
        tags: {
          dependency: "supabase",
          pageType: "album",
          supabaseOperation: "page.album.community_summary",
        },
      });
    }

    // Preserve the known album-level stats while making the query failure explicit.
    return {
      averageRating: releaseGroup.avg_rating,
      availability: "unavailable",
      favoriteTracks: [],
      ratingHistogram: buildRatingHistogram([]),
      reviewCount: releaseGroup.review_count ?? 0,
      standoutTrack: null,
    };
  }

  return buildAlbumCommunitySummary(releaseGroup, reviews);
}
