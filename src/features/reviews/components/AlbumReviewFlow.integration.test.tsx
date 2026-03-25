import { cleanup, screen } from "@testing-library/react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlbumReviewFlow } from "@/features/reviews/components/AlbumReviewFlow";
import type { Album, Review } from "@/shared/types";
import { render } from "@/shared/test/utils/render";

const useAuthMock = vi.hoisted(() => vi.fn());
const useUserAlbumReviewMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/features/reviews/hooks/useUserAlbumReview", () => ({
  useUserAlbumReview: useUserAlbumReviewMock,
}));

vi.mock("@/features/reviews/commands/submitReview", () => ({
  submitReview: vi.fn(),
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
    {
      id: "track-2",
      name: "Bodysnatchers",
      track_number: 2,
      duration_ms: 242000,
    },
  ],
};

const savedReview: Review = {
  id: "review-1",
  user_id: "user-123",
  album_id: "album-1",
  rating: 4,
  review_text: "",
  favorite_track_id: "",
  created_at: "2026-03-20T12:00:00.000Z",
  updated_at: "2026-03-20T12:00:00.000Z",
};

describe("AlbumReviewFlow draft behavior", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useUserAlbumReviewMock.mockReset();
    useAuthMock.mockReturnValue({
      user: { id: "user-123" },
      profile: null,
      isLoading: false,
      logout: vi.fn(),
    });
    useUserAlbumReviewMock.mockReturnValue({
      review: savedReview,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("restores unsaved composer text after closing and reopening within the same page session", async () => {
    const user = userEvent.setup();

    render(<AlbumReviewFlow album={mockAlbum} />);

    await user.click(
      screen.getByRole("button", {
        name: "Add review details",
      }),
    );

    const composerInput = screen.getByLabelText("Thoughts (optional)");

    await user.type(composerInput, "Draft thoughts");
    await user.click(
      within(screen.getByRole("dialog")).getAllByRole("button", {
        name: "Close",
      })[0],
    );
    await user.click(
      screen.getByRole("button", {
        name: "Add review details",
      }),
    );

    expect(screen.getByLabelText("Thoughts (optional)")).toHaveValue(
      "Draft thoughts",
    );
  });
});
