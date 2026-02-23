"use client";

import { StarRating } from "../StarRating";
import { Button } from "@/components/ui-core/button";
import { Database } from "@/lib/types/database.types";
import { useQuickReview } from "@/hooks/useQuickReview";

// TODO: Extract this to its own file.
type Album = Omit<
  Database["public"]["Tables"]["albums"]["Row"],
  "created_at" | "last_synced_at" | "tracks"
> & {
  tracks: {
    id: string;
    name: string;
    track_number: number;
    duration_ms: number;
  }[];
};
interface ReviewFormProps {
  album: Album;
}

/**
 * Fetches the user's existing review and renders InnerReviewForm.
 * Quick review just allows the user to rate an album from 1 - 5 stars with 0.5 increments.
 */
export function QuickReview({ album }: ReviewFormProps) {
  const { rating, onRatingChanged } = useQuickReview({ albumId: album.id });

  return (
    <div className="flex justify-center align-center flex-col w-full lg:w-fit border rounded-md bg-card">
      <div className="border-b w-full p-4 flex justify-center flex-col">
        <div className="text-sm font-medium text-center">
          {rating ? "Rated" : "Rate"}
        </div>
        <div className="flex justify-center">
          <StarRating value={rating} onChange={onRatingChanged} size="lg" />
        </div>
      </div>
      <Button variant="ghost" className="w-full rounded-none text-sm">
        {rating ? "Edit your review" : "Log review"}
      </Button>
    </div>
  );
}
