import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { renderHook } from "@/test/test-utils";
import { useReviewForm } from "./useReviewForm";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123" },
    profile: null,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/mutations/submitReview", () => ({
  submitReview: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/mutations/deleteReview", () => ({
  deleteReview: vi.fn().mockResolvedValue(undefined),
}));

const mockAlbum = {
  id: "album-1",
  spotify_id: "spotify-album-1",
  title: "OK Computer",
  artist: "Radiohead",
  release_date: "1997-05-21",
  images: [],
  slug: "radiohead-ok-computer",
  tracks: [
    { id: "t1", name: "Airbag", track_number: 1, duration_ms: 283000 },
    {
      id: "t2",
      name: "Paranoid Android",
      track_number: 2,
      duration_ms: 383000,
    },
  ],
  avg_rating: 5,
  review_count: 10,
};

describe("useReviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default state when no existing review", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    expect(result.current.rating).toBe(0);
    expect(result.current.reviewText).toBe("");
    expect(result.current.favoriteTrackId).toBe("");
    expect(result.current.isEditMode).toBe(false);
  });

  it("initializes with existing review data", () => {
    const existingReview = {
      id: "review-1",
      user_id: "user-123",
      album_id: "album-1",
      rating: 4.5,
      review_text: "Masterpiece",
      favorite_track_id: "t2",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const { result } = renderHook(() =>
      useReviewForm({ album: mockAlbum, existingReview }),
    );

    expect(result.current.rating).toBe(4.5);
    expect(result.current.reviewText).toBe("Masterpiece");
    expect(result.current.favoriteTrackId).toBe("t2");
    expect(result.current.isEditMode).toBe(true);
  });

  it("updates rating via setRating", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    act(() => {
      result.current.setRating(3);
    });

    expect(result.current.rating).toBe(3);
  });

  it("updates review text via setReviewText", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    act(() => {
      result.current.setReviewText("Great album");
    });

    expect(result.current.reviewText).toBe("Great album");
  });

  it("updates favorite track via setFavoriteTrackId", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    act(() => {
      result.current.setFavoriteTrackId("t1");
    });

    expect(result.current.favoriteTrackId).toBe("t1");
  });

  it("reports invalid when rating is 0", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    expect(result.current.isFormValid).toBe(false);
  });

  it("reports valid when rating is set", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    act(() => {
      result.current.setRating(3);
    });

    expect(result.current.isFormValid).toBe(true);
  });

  it("sets validation errors on submit with invalid form", () => {
    const { result } = renderHook(() => useReviewForm({ album: mockAlbum }));

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.errors.rating).toBeDefined();
  });
});
