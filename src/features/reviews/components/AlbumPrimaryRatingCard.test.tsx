import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlbumPrimaryRatingCard } from "@/features/reviews/components/AlbumPrimaryRatingCard";
import { render } from "@/shared/test/utils/render";
import type { UseAlbumReviewStateResult } from "@/features/reviews/types";
import type { Album } from "@/shared/types";

const mockAlbum: Album = {
  id: "album-1",
  spotify_id: "spotify-album-1",
  title: "In Rainbows",
  artist: "Radiohead",
  label: "XL",
  slug: "radiohead-in-rainbows",
  release_date: "2007-10-10",
  avg_rating: 4.5,
  review_count: 12,
  images: [],
  tracks: [
    { id: "track-1", name: "15 Step", track_number: 1, duration_ms: 237000 },
    {
      id: "track-2",
      name: "Bodysnatchers",
      track_number: 2,
      duration_ms: 242000,
    },
  ],
};

/**
 * Builds the primary-card state needed for detail-reflection tests.
 */
function createReviewState(
  overrides: Partial<UseAlbumReviewStateResult> = {},
): UseAlbumReviewStateResult {
  return {
    favoriteTrackId: "track-2",
    reviewText: "Still opens up on every listen.",
    rating: 4.5,
    savedReviewText: "Still opens up on every listen.",
    savedRating: 4.5,
    savedFavoriteTrackId: "track-2",
    composerError: null,
    ratingError: null,
    isComposerDirty: false,
    isComposerSaving: false,
    isRatingSaving: false,
    hasSavedReview: true,
    hasSavedFavoriteTrack: true,
    hasSavedReviewText: true,
    saveComposer: vi.fn().mockResolvedValue(true),
    setFavoriteTrackId: vi.fn(),
    setReviewText: vi.fn(),
    setRating: vi.fn(),
    ...overrides,
  };
}

describe("AlbumPrimaryRatingCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("reflects saved favorite-song and note details without reopening the composer", () => {
    render(
      <AlbumPrimaryRatingCard
        album={mockAlbum}
        onOpenComposer={vi.fn()}
        reviewState={createReviewState()}
      />,
    );

    expect(screen.getByText("Saved details")).toBeInTheDocument();
    expect(
      screen.getByText("Favorite song: 2. Bodysnatchers"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Still opens up on every listen."),
    ).toBeInTheDocument();
  });
});
