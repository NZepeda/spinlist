import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "@/lib/types";

const {
  mockCreateClient,
  mockEq,
  mockFrom,
  mockSelect,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockEq: vi.fn(),
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
}));

vi.mock("./supabase/server", () => ({
  createClient: mockCreateClient,
}));

import {
  buildAlbumCommunitySummary,
  getAlbumCommunitySummary,
} from "./getAlbumCommunitySummary";

const mockAlbum: Album = {
  id: "album-1",
  spotify_id: "spotify-album-1",
  title: "Discovery",
  artist: "Daft Punk",
  label: "Virgin",
  slug: "daft-punk-discovery",
  release_date: "2001-03-12",
  avg_rating: 4.4,
  review_count: 5,
  images: [],
  tracks: [
    {
      id: "track-1",
      name: "One More Time",
      track_number: 1,
      duration_ms: 320000,
    },
    {
      id: "track-2",
      name: "Digital Love",
      track_number: 2,
      duration_ms: 300000,
    },
    {
      id: "track-3",
      name: "Harder, Better, Faster, Stronger",
      track_number: 3,
      duration_ms: 225000,
    },
  ],
};

describe("buildAlbumCommunitySummary", () => {
  beforeEach(() => {
    mockEq.mockReset();
    mockSelect.mockReset();
    mockFrom.mockReset();
    mockCreateClient.mockReset();
  });

  it("builds a rating histogram and standout track summary", () => {
    const summary = buildAlbumCommunitySummary(mockAlbum, [
      { rating: 4.5, favorite_track_id: "track-1" },
      { rating: 5, favorite_track_id: "track-1" },
      { rating: 4, favorite_track_id: "track-2" },
      { rating: 4.5, favorite_track_id: null },
    ]);

    expect(summary.reviewCount).toBe(5);
    expect(summary.averageRating).toBe(4.4);
    expect(summary.standoutTrack).toEqual({
      count: 2,
      percentage: 67,
      trackId: "track-1",
      trackName: "One More Time",
    });
    expect(
      summary.ratingHistogram.find((bucket) => bucket.rating === 4.5)?.count,
    ).toBe(2);
    expect(
      summary.ratingHistogram.find((bucket) => bucket.rating === 5)?.count,
    ).toBe(1);
  });

  it("ignores favorite-song ids that do not belong to the album", () => {
    const summary = buildAlbumCommunitySummary(mockAlbum, [
      { rating: 3.5, favorite_track_id: "missing-track" },
    ]);

    expect(summary.favoriteTracks).toEqual([]);
    expect(summary.standoutTrack).toBeNull();
  });

  it("falls back to the review rows length when the album count is missing", () => {
    const summary = buildAlbumCommunitySummary(
      {
        ...mockAlbum,
        review_count: null,
      },
      [
        { rating: 4, favorite_track_id: null },
        { rating: 4.5, favorite_track_id: "track-2" },
      ],
    );

    expect(summary.reviewCount).toBe(2);
  });

  it("marks the summary as unavailable when the reviews query fails", async () => {
    mockEq.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockCreateClient.mockResolvedValue({
      from: mockFrom,
    });

    const summary = await getAlbumCommunitySummary(mockAlbum);

    expect(summary).toMatchObject({
      averageRating: 4.4,
      availability: "unavailable",
      reviewCount: 5,
      standoutTrack: null,
    });
    expect(summary.ratingHistogram.every((bucket) => bucket.count === 0)).toBe(
      true,
    );
  });
});
