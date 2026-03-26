import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlbumReviewFlow } from "@/features/reviews/components/AlbumReviewFlow";
import type { Album, Profile } from "@/shared/types";
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

vi.mock("@/features/reviews/hooks/useAlbumReviewState", () => ({
  useAlbumReviewState: () => ({
    composerError: null,
    favoriteTrackId: "",
    hasSavedFavoriteTrack: false,
    rating: 0,
    hasSavedReview: false,
    hasSavedReviewText: false,
    isComposerDirty: false,
    isComposerSaving: false,
    ratingError: null,
    isRatingSaving: false,
    reviewText: "",
    saveComposer: vi.fn(),
    savedFavoriteTrackId: "",
    savedRating: 0,
    savedReviewText: "",
    setFavoriteTrackId: vi.fn(),
    setRating: vi.fn(),
    setReviewText: vi.fn(),
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

  it("shows the pending verification prompt when the listener is signed in but not active", () => {
    const pendingProfile: Profile = {
      avatarUrl: null,
      createdAt: "2026-03-25T00:00:00.000Z",
      id: "user-123",
      status: "pending",
      updatedAt: "2026-03-25T00:00:00.000Z",
      username: "listener",
    };

    useAuthMock.mockReturnValue({
      user: {
        email: "listener@example.com",
        id: "user-123",
      },
      profile: pendingProfile,
      isLoading: false,
      logout: vi.fn(),
    });

    render(<AlbumReviewFlow album={mockAlbum} />);

    expect(
      screen.getByText("Confirm your email to rate this album"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Tap a star to rate this album. Your score saves instantly."),
    ).not.toBeInTheDocument();
  });

  it("shows the review controls when the listener is active", () => {
    const activeProfile: Profile = {
      avatarUrl: null,
      createdAt: "2026-03-25T00:00:00.000Z",
      id: "user-123",
      status: "active",
      updatedAt: "2026-03-25T00:00:00.000Z",
      username: "listener",
    };

    useAuthMock.mockReturnValue({
      user: {
        email: "listener@example.com",
        id: "user-123",
      },
      profile: activeProfile,
      isLoading: false,
      logout: vi.fn(),
    });

    render(<AlbumReviewFlow album={mockAlbum} />);

    expect(screen.getByText("Rate this album")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Add review details",
      }),
    ).toBeInTheDocument();
  });
});
