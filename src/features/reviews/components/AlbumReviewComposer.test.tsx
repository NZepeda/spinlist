import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlbumReviewComposer } from "@/features/reviews/components/AlbumReviewComposer";
import { render } from "@/shared/test/utils/render";
import type { UseAlbumReviewStateResult } from "@/features/reviews/hooks/useAlbumReviewState";

/**
 * Builds the composer state used by the dialog tests.
 */
function createReviewState(
  overrides: Partial<UseAlbumReviewStateResult> = {},
): UseAlbumReviewStateResult {
  return {
    reviewText: "",
    rating: 4,
    savedRating: 4,
    composerError: null,
    ratingError: null,
    isComposerDirty: false,
    isComposerSaving: false,
    isRatingSaving: false,
    hasSavedReview: true,
    hasSavedReviewText: false,
    saveComposer: vi.fn().mockResolvedValue(true),
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
});
