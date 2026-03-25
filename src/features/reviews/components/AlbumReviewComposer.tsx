"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { UseAlbumReviewStateResult } from "@/features/reviews/hooks/useAlbumReviewState";

interface AlbumReviewComposerProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reviewState: UseAlbumReviewStateResult;
}

/**
 * Opens the secondary review flow while keeping the main page focused on rating.
 */
export function AlbumReviewComposer({
  onOpenChange,
  open,
  reviewState,
}: AlbumReviewComposerProps) {
  /**
   * Saves the current text draft and closes the composer only after a successful write.
   */
  async function handleSave(): Promise<void> {
    const wasSaved = await reviewState.saveComposer();

    if (wasSaved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        presentation="full-screen"
        className="grid-rows-[auto_minmax(0,1fr)_auto] gap-0 md:top-[50%] md:left-[50%] md:h-auto md:max-h-[min(88dvh,42rem)] md:w-[min(100%-2rem,42rem)] md:max-w-none md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-2xl md:border md:p-6"
      >
        <DialogHeader className="pb-6 pr-12 text-left">
          <DialogTitle>Review details</DialogTitle>
          <DialogDescription>
            Add a note now or come back later. Nothing here is published until
            you save it explicitly.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto pb-6">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="album-review-composer-text"
            >
              Thoughts <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="album-review-composer-text"
              maxLength={2000}
              placeholder="What kept pulling you back in?"
              value={reviewState.reviewText}
              aria-invalid={Boolean(reviewState.composerError)}
              onChange={(event) => {
                reviewState.setReviewText(event.target.value);
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Short notes are enough.</span>
              <span>{reviewState.reviewText.length}/2000</span>
            </div>
          </div>

          {reviewState.composerError ? (
            <p className="text-sm text-error" role="alert">
              {reviewState.composerError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="brand"
            disabled={!reviewState.isComposerDirty || reviewState.isComposerSaving}
            onClick={() => {
              void handleSave();
            }}
          >
            {reviewState.isComposerSaving ? "Saving..." : "Save review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
