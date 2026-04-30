"use client";

import { Suspense } from "react";
import { isActiveProfile } from "@/features/auth/isActiveProfile";
import { AlbumPrimaryRatingCard } from "@/features/reviews/components/AlbumPrimaryRatingCard";
import { AlbumReviewComposer } from "@/features/reviews/components/AlbumReviewComposer";
import { LoginPromptCard } from "@/features/reviews/components/LoginPromptCard";
import { PendingVerificationPromptCard } from "@/features/reviews/components/PendingVerificationPromptCard";
import { ReviewFormSkeleton } from "@/features/reviews/components/ReviewFormSkeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAlbumReviewState } from "@/features/reviews/hooks/useAlbumReviewState";
import { useUserAlbumReview } from "@/features/reviews/hooks/useUserAlbumReview";
import { useState } from "react";
import type { AlbumRecord } from "@/shared/types";

interface AlbumReviewFlowProps {
  album: AlbumRecord;
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
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { review } = useUserAlbumReview(album.id);
  const reviewState = useAlbumReviewState({
    album,
    review,
  });

  return (
    <>
      <AlbumPrimaryRatingCard
        album={album}
        reviewState={reviewState}
        onOpenComposer={() => {
          setIsComposerOpen(true);
        }}
      />
      <AlbumReviewComposer
        album={album}
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        reviewState={reviewState}
      />
    </>
  );
}

/**
 * Renders the UI allowing user to leave an album rating.
 */
export function AlbumReviewFlow({ album }: AlbumReviewFlowProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <ReviewFlowFallback />;
  }

  if (!user) {
    return <LoginPromptCard />;
  }

  if (!isActiveProfile(profile)) {
    return <PendingVerificationPromptCard email={user.email} />;
  }

  return (
    <Suspense fallback={<ReviewFlowFallback />}>
      <AuthenticatedAlbumReviewFlow album={album} />
    </Suspense>
  );
}
