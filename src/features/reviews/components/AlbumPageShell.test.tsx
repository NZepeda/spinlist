import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlbumPageShell } from "@/features/reviews/components/AlbumPageShell";
import type { AlbumReviewFeedItem } from "@/features/reviews/server/getAlbumReviewFeed";
import type { AlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";
import type { Album } from "@/shared/types";
import { render } from "@/shared/test/utils/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

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

const mockCommunitySummary: AlbumCommunitySummary = {
  averageRating: 4.3,
  availability: "available",
  favoriteTracks: [
    {
      count: 4,
      percentage: 50,
      trackId: "track-2",
      trackName: "Bodysnatchers",
    },
  ],
  ratingHistogram: [
    { rating: 0.5, count: 0 },
    { rating: 1, count: 0 },
    { rating: 1.5, count: 0 },
    { rating: 2, count: 0 },
    { rating: 2.5, count: 0 },
    { rating: 3, count: 1 },
    { rating: 3.5, count: 1 },
    { rating: 4, count: 2 },
    { rating: 4.5, count: 4 },
    { rating: 5, count: 2 },
  ],
  reviewCount: 10,
  standoutTrack: {
    count: 4,
    percentage: 50,
    trackId: "track-2",
    trackName: "Bodysnatchers",
  },
};

const mockReviewFeed: AlbumReviewFeedItem[] = [
  {
    createdAt: "2026-03-14T12:00:00.000Z",
    favoriteTrackId: "track-2",
    favoriteTrackName: "Bodysnatchers",
    id: "review-1",
    rating: 4.5,
    reviewText: "Still sounds urgent years later.",
    username: "nestor",
  },
];

/**
 * Returns whether one DOM node appears after another in document order.
 */
function appearsAfter(
  firstNode: HTMLElement,
  secondNode: HTMLElement,
): boolean {
  return Boolean(
    firstNode.compareDocumentPosition(secondNode) &
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe("AlbumPageShell", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the album page with the appropriate sections", () => {
    render(
      <AlbumPageShell
        album={mockAlbum}
        communitySummary={mockCommunitySummary}
        imageUrl={null}
        reviewFeed={mockReviewFeed}
      />,
    );

    const overviewHeading = screen.getByRole("heading", {
      level: 1,
      name: "In Rainbows",
    });
    const communityHeading = screen.getByRole("heading", {
      level: 2,
      name: "Community snapshot",
    });
    const reviewsHeading = screen.getByRole("heading", {
      level: 2,
      name: "Recent reviews",
    });
    const detailsHeading = screen.getByRole("heading", {
      level: 2,
      name: "Album details",
    });
    const tracklistHeading = screen.getByRole("heading", {
      level: 2,
      name: "Tracklist",
    });

    expect(appearsAfter(overviewHeading, communityHeading)).toBe(true);
    expect(appearsAfter(communityHeading, reviewsHeading)).toBe(true);
    expect(appearsAfter(reviewsHeading, detailsHeading)).toBe(true);
    expect(appearsAfter(detailsHeading, tracklistHeading)).toBe(true);
  });
});
