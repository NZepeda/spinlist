"use client";

import { useReviewForm } from "@/hooks/useReviewForm";
import { useUserReview } from "@/hooks/useUserReview";
import { Album } from "@/lib/types/album";
import { Review } from "@/lib/types/review";
import { useState } from "react";
import { StarRating } from "../StarRating";
import { Textarea } from "../ui-core/textarea";
import { Select, SelectOption } from "../ui-core/select";
import { Button } from "../ui-core/button";

interface ReviewFormProps {
  album: Album;
}

function InnerReviewForm({
  album,
  existingReview,
}: {
  album: Album;
  existingReview?: Review;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    rating,
    reviewText,
    favoriteTrackId,
    errors,
    isLoading,
    setRating,
    setReviewText,
    setFavoriteTrackId,
    handleSubmit,
    handleDelete,
    isEditMode,
  } = useReviewForm({
    album,
    existingReview,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const onDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const onDeleteConfirm = () => {
    handleDelete();
    setShowDeleteConfirm(false);
  };

  const onDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="border rounded-lg p-6 bg-card space-y-4">
      <h3 className="text-lg font-medium">
        {isEditMode ? "Edit your review" : "Write a review"}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
          {errors.rating && (
            <p className="text-sm text-destructive">{errors.rating}</p>
          )}
        </div>

        {/* Favorite Track */}
        <div className="space-y-2">
          <label htmlFor="favorite-track" className="text-sm font-medium">
            Favorite track (optional)
          </label>
          <Select
            id="favorite-track"
            value={favoriteTrackId}
            onChange={(e) => setFavoriteTrackId(e.target.value)}
            disabled={isLoading}
            className="w-full"
          >
            <SelectOption value="">None</SelectOption>
            {(album.tracks || []).map((track) => (
              <SelectOption key={track.id} value={track.id}>
                {track.track_number}. {track.name}
              </SelectOption>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="review-text" className="text-sm font-medium">
            Review (optional)
          </label>
          <Textarea
            id="review-text"
            placeholder="Share your thoughts about this album..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={2000}
            aria-invalid={Boolean(errors.reviewText)}
            disabled={isLoading}
            className="min-h-24"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{errors.reviewText || ""}</span>
            <span>{reviewText.length}/2000</span>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <p className="text-sm text-destructive">{errors.general}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditMode
                ? "Update review"
                : "Submit review"}
          </Button>

          {isEditMode && !showDeleteConfirm && (
            <Button
              type="button"
              variant="outline"
              onClick={onDeleteClick}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-md">
            <p className="text-sm flex-1">Delete this review?</p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeleteCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Fetches the user's existing review and renders InnerReviewForm.
 * Must be wrapped in a Suspense boundary as it uses useSuspenseQuery internally.
 */
export function ReviewForm({ album }: ReviewFormProps) {
  const { review } = useUserReview({ spotifyAlbumId: album.id });

  return <InnerReviewForm album={album} existingReview={review ?? undefined} />;
}
