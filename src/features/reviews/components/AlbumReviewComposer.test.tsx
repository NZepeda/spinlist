import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlbumReviewComposer } from "@/features/reviews/components/AlbumReviewComposer";
import { render } from "@/shared/test/utils/render";
import type { UseAlbumReviewStateResult } from "@/features/reviews/hooks/useAlbumReviewState";
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
 * Builds the composer state used by the dialog tests.
 */
function createReviewState(
  overrides: Partial<UseAlbumReviewStateResult> = {},
): UseAlbumReviewStateResult {
  return {
    favoriteTrackId: "",
    reviewText: "",
    rating: 4,
    savedReviewText: "",
    savedRating: 4,
    savedFavoriteTrackId: "",
    composerError: null,
    ratingError: null,
    isComposerDirty: false,
    isComposerSaving: false,
    isRatingSaving: false,
    hasSavedReview: true,
    hasSavedFavoriteTrack: false,
    hasSavedReviewText: false,
    saveComposer: vi.fn().mockResolvedValue(true),
    setFavoriteTrackId: vi.fn(),
    setReviewText: vi.fn(),
    setRating: vi.fn(),
    ...overrides,
  };
}

describe("AlbumReviewComposer", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a full-screen mobile surface with desktop modal overrides", () => {
    render(
      <AlbumReviewComposer
        album={mockAlbum}
        open
        onOpenChange={vi.fn()}
        reviewState={createReviewState()}
      />,
    );

    const dialogContent = document.querySelector(
      '[data-slot="dialog-content"]',
    );

    expect(dialogContent).not.toBeNull();
    expect(dialogContent?.className).toContain("h-dvh");
    expect(dialogContent?.className).toContain("md:h-auto");
    expect(dialogContent?.className).toContain("md:rounded-2xl");
  });

  it("saves explicitly and closes only after the save succeeds", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const saveComposer = vi.fn().mockResolvedValue(true);

    render(
      <AlbumReviewComposer
        album={mockAlbum}
        open
        onOpenChange={onOpenChange}
        reviewState={createReviewState({
          isComposerDirty: true,
          reviewText: "A keeper.",
          saveComposer,
        })}
      />,
    );

    const dialog = screen.getByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", {
        name: "Save review",
      }),
    );

    expect(saveComposer).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses a select list for favorite-song changes", async () => {
    const user = userEvent.setup();
    const setFavoriteTrackId = vi.fn();

    render(
      <AlbumReviewComposer
        album={mockAlbum}
        open
        onOpenChange={vi.fn()}
        reviewState={createReviewState({
          setFavoriteTrackId,
        })}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Favorite song (optional)"),
      "track-2",
    );

    expect(setFavoriteTrackId).toHaveBeenCalledWith("track-2");
    expect(screen.queryByText("Tracklist")).not.toBeInTheDocument();
  });
});
