"use client";

import { Suspense } from "react";
import { AlbumLogCard } from "@/features/reviews/components/AlbumLogCard";
import { LoginPromptCard } from "@/features/reviews/components/LoginPromptCard";
import { ReviewFormSkeleton } from "@/features/reviews/components/ReviewFormSkeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviewForm } from "@/features/reviews/hooks/useReviewForm";
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
  const reviewForm = useReviewForm({
    album,
    existingReview: review,
  });

  return <AlbumLogCard album={album} reviewForm={reviewForm} />;
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
