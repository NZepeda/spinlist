"use client";

import { Suspense } from "react";
import { AlbumPrimaryRatingCard } from "@/features/reviews/components/AlbumPrimaryRatingCard";
import { LoginPromptCard } from "@/features/reviews/components/LoginPromptCard";
import { ReviewFormSkeleton } from "@/features/reviews/components/ReviewFormSkeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAlbumReviewState } from "@/features/reviews/hooks/useAlbumReviewState";
import { useUserAlbumReview } from "@/features/reviews/hooks/useUserAlbumReview";
import type { Album } from "@/shared/types";

interface AlbumReviewFlowProps {
  album: Album;
}

/**
 * Fallback UI while the current user's saved album log is loading.
 */
function ReviewFlowFallback() {
  return <ReviewFormSkeleton />;
}

/**
 * Authenticated review view that renders the current user's album log controls.
 */
function AuthenticatedAlbumReviewFlow({ album }: AlbumReviewFlowProps) {
  const { review } = useUserAlbumReview(album.id);
  const reviewState = useAlbumReviewState({
    album,
    review,
  });

  return <AlbumPrimaryRatingCard reviewState={reviewState} />;
}

/**
 * Coordinates the auth-gated primary action area shown inside the album hero.
 */
export function AlbumReviewFlow({ album }: AlbumReviewFlowProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <ReviewFlowFallback />;
  }

  if (!user) {
    return <LoginPromptCard />;
  }

  return (
    <Suspense fallback={<ReviewFlowFallback />}>
      <AuthenticatedAlbumReviewFlow album={album} />
    </Suspense>
  );
}
