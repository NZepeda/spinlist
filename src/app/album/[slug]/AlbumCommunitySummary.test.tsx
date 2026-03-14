import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "@/test/utils/render";
import type { AlbumCommunitySummary as AlbumCommunitySummaryData } from "@/lib/getAlbumCommunitySummary";
import { AlbumCommunitySummary } from "./AlbumCommunitySummary";

/**
 * Builds a community-summary object for render tests.
 */
function createSummary(
  overrides: Partial<AlbumCommunitySummaryData> = {},
): AlbumCommunitySummaryData {
  return {
    averageRating: 4.5,
    availability: "available",
    favoriteTracks: [
      {
        count: 3,
        percentage: 60,
        trackId: "track-1",
        trackName: "Everything in Its Right Place",
      },
    ],
    ratingHistogram: [
      { rating: 0.5, count: 0 },
      { rating: 1, count: 0 },
      { rating: 1.5, count: 0 },
      { rating: 2, count: 0 },
      { rating: 2.5, count: 0 },
      { rating: 3, count: 0 },
      { rating: 3.5, count: 1 },
      { rating: 4, count: 1 },
      { rating: 4.5, count: 2 },
      { rating: 5, count: 1 },
    ],
    reviewCount: 5,
    standoutTrack: {
      count: 3,
      percentage: 60,
      trackId: "track-1",
      trackName: "Everything in Its Right Place",
    },
    ...overrides,
  };
}

describe("AlbumCommunitySummary", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the populated community snapshot", () => {
    render(<AlbumCommunitySummary summary={createSummary()} />);

    expect(screen.getByText("Community snapshot")).toBeInTheDocument();
    expect(screen.getByText("Rating spread")).toBeInTheDocument();
    expect(screen.getByText("Standout track")).toBeInTheDocument();
    expect(
      screen.getAllByText("Everything in Its Right Place"),
    ).toHaveLength(2);
  });

  it("renders the empty community message when there are no logs", () => {
    render(
      <AlbumCommunitySummary
        summary={createSummary({
          averageRating: null,
          favoriteTracks: [],
          ratingHistogram: createSummary().ratingHistogram.map((bucket) => ({
            ...bucket,
            count: 0,
          })),
          reviewCount: 0,
          standoutTrack: null,
        })}
      />,
    );

    expect(
      screen.getByText("No community data yet. The first few reviews will set the tone here."),
    ).toBeInTheDocument();
  });

  it("renders an unavailable message when the aggregate query fails", () => {
    render(
      <AlbumCommunitySummary
        summary={createSummary({
          availability: "unavailable",
          favoriteTracks: [],
          standoutTrack: null,
        })}
      />,
    );

    expect(
      screen.getByText(
        "Community details are temporarily unavailable. Album-level stats may still appear here while the full breakdown reloads.",
      ),
    ).toBeInTheDocument();
  });
});
