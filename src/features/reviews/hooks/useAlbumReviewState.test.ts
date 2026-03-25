import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { renderHook } from "@/shared/test/utils/renderHook";
import { useAlbumReviewState } from "@/features/reviews/hooks/useAlbumReviewState";
import { submitReview } from "@/features/reviews/commands/submitReview";

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123" },
    profile: null,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/features/reviews/commands/submitReview", () => ({
  submitReview: vi.fn(),
}));

const mockAlbum = {
  label: "XL",
  id: "album-1",
  spotify_id: "spotify-album-1",
  title: "In Rainbows",
  artist: "Radiohead",
  release_date: "2007-10-10",
  images: [],
  slug: "radiohead-in-rainbows",
  streaming_links: {},
  tracks: [
    { id: "t1", name: "15 Step", track_number: 1, duration_ms: 237000 },
    {
      id: "t2",
      name: "Bodysnatchers",
      track_number: 2,
      duration_ms: 242000,
    },
  ],
  avg_rating: 4.2,
  review_count: 10,
};

describe("useAlbumReviewState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes from the saved review rating", () => {
    const review = {
      id: "review-1",
      user_id: "user-123",
      album_id: "album-1",
      rating: 4.5,
      review_text: "Still incredible.",
      favorite_track_id: "t2",
      created_at: "2026-03-20T12:00:00.000Z",
      updated_at: "2026-03-20T12:00:00.000Z",
    };

    const { result } = renderHook(() =>
      useAlbumReviewState({
        album: mockAlbum,
        review,
      }),
    );

    expect(result.current.rating).toBe(4.5);
    expect(result.current.savedRating).toBe(4.5);
    expect(result.current.hasSavedReview).toBe(true);
  });

  it("autosaves rating changes while preserving existing review details", async () => {
    const submitReviewMock = vi.mocked(submitReview);
    const review = {
      id: "review-1",
      user_id: "user-123",
      album_id: "album-1",
      rating: 4.5,
      review_text: "Still incredible.",
      favorite_track_id: "t2",
      created_at: "2026-03-20T12:00:00.000Z",
      updated_at: "2026-03-20T12:00:00.000Z",
    };

    submitReviewMock.mockResolvedValue({
      id: "review-1",
      user_id: "user-123",
      album_id: "album-1",
      rating: 3.5,
      review_text: "Still incredible.",
      favorite_track_id: "t2",
      created_at: "2026-03-20T12:00:00.000Z",
      updated_at: "2026-03-21T12:00:00.000Z",
    });

    const { result } = renderHook(() =>
      useAlbumReviewState({
        album: mockAlbum,
        review,
      }),
    );

    act(() => {
      result.current.setRating(3.5);
    });

    await vi.waitFor(() => {
      expect(submitReviewMock).toHaveBeenCalledWith({
        userId: "user-123",
        albumId: "album-1",
        existingReviewId: "review-1",
        favoriteTrackId: "t2",
        rating: 3.5,
        reviewText: "Still incredible.",
      });
    });

    await vi.waitFor(() => {
      expect(result.current.savedRating).toBe(3.5);
      expect(result.current.rating).toBe(3.5);
    });
  });
});
