import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlbumReviewFlow } from "@/features/reviews/components/AlbumReviewFlow";
import type { Album } from "@/shared/types";
import { render } from "@/shared/test/utils/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/features/reviews/hooks/useUserAlbumReview", () => ({
  useUserAlbumReview: () => ({
    review: null,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/reviews/hooks/useReviewForm", () => ({
  useReviewForm: () => ({
    rating: 0,
    reviewText: "",
    favoriteTrackId: "",
    errors: {},
    isLoading: false,
    isDirty: false,
    isFormValid: false,
    setRating: vi.fn(),
    setReviewText: vi.fn(),
    setFavoriteTrackId: vi.fn(),
    handleSubmit: vi.fn(),
    handleDelete: vi.fn(),
    isEditMode: false,
  }),
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
  streaming_links: {},
  tracks: [
    { id: "track-1", name: "15 Step", track_number: 1, duration_ms: 237000 },
  ],
};

describe("AlbumReviewFlow", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the login prompt when the listener is signed out", () => {
    useAuthMock.mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      logout: vi.fn(),
    });

    render(<AlbumReviewFlow album={mockAlbum} />);

    expect(screen.getByText("Log in to rate this album")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Log in",
      }),
    ).toHaveAttribute("href", "/login");
  });
});
