import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AlbumReviewFeedItem } from "@/features/reviews/server/getAlbumReviewFeed";
import { render } from "@/shared/test/utils/render";
import { ReviewsFeed } from "./ReviewsFeed";

/**
 * Builds a feed item for review-feed tests.
 */
function createReview(
  overrides: Partial<AlbumReviewFeedItem> = {},
): AlbumReviewFeedItem {
  return {
    createdAt: "2026-03-14T12:00:00.000Z",
    favoriteTrackId: "track-1",
    favoriteTrackName: "Jigsaw Falling Into Place",
    id: "review-1",
    rating: 4.5,
    reviewText: "The back half keeps opening up with every listen.",
    username: "nestor",
    ...overrides,
  };
}

describe("ReviewsFeed", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an empty state when no written reviews exist", () => {
    render(<ReviewsFeed reviews={[]} />);

    expect(
      screen.getByText(
        "No written reviews yet. The first note can set the tone for this album.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a review with its rating and favorite-song badge", () => {
    render(<ReviewsFeed reviews={[createReview()]} />);

    expect(screen.getByText("@nestor")).toBeInTheDocument();
    expect(screen.getByText("4.5/5")).toBeInTheDocument();
    expect(
      screen.getByText("Favorite song: Jigsaw Falling Into Place"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The back half keeps opening up with every listen."),
    ).toBeInTheDocument();
  });

  it("omits the favorite-song badge when the review has no pick", () => {
    render(
      <ReviewsFeed
        reviews={[
          createReview({
            favoriteTrackId: null,
            favoriteTrackName: null,
          }),
        ]}
      />,
    );

    expect(screen.queryByText(/Favorite song:/i)).not.toBeInTheDocument();
  });
});
