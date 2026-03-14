"use client";

import { Suspense } from "react";
import { AlbumLogCard } from "@/components/review/AlbumLogCard";
import { AlbumTracklist } from "@/components/review/AlbumTracklist";
import { LoginPromptCard } from "@/components/review/LoginPromptCard";
import { ReviewFormSkeleton } from "@/components/review/ReviewFormSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useReviewForm } from "@/hooks/useReviewForm";
import { useUserAlbumReview } from "@/hooks/useUserAlbumReview";
import type { AlbumCommunitySummary as AlbumCommunitySummaryData } from "@/lib/getAlbumCommunitySummary";
import type { Album } from "@/lib/types";
import { AlbumCommunitySummary } from "./AlbumCommunitySummary";

interface AlbumReviewExperienceProps {
  album: Album;
  communitySummary: AlbumCommunitySummaryData;
}

interface AlbumDetailsColumnProps {
  album: Album;
  children: React.ReactNode;
  communitySummary: AlbumCommunitySummaryData;
}

/**
 * Renders the album details shown above the review card.
 */
function AlbumMetadata({ album }: AlbumReviewExperienceProps) {
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">{album.title}</h1>
      <p className="text-xl text-muted-foreground">
        {album.artist},{" "}
        {album.release_date ? new Date(album.release_date).getFullYear() : null}
      </p>
      <p className="text-base text-muted-foreground">
        {album.label ? album.label : "Unknown Label"}
      </p>
    </div>
  );
}

/**
 * Renders the shared album details column used across auth states.
 */
function AlbumDetailsColumn({
  album,
  children,
  communitySummary,
}: AlbumDetailsColumnProps) {
  return (
    <div className="space-y-6">
      <AlbumMetadata album={album} communitySummary={communitySummary} />
      <AlbumCommunitySummary summary={communitySummary} />
      {children}
    </div>
  );
}

/**
 * Fallback UI while the current user's saved album log is loading.
 */
function ReviewExperienceFallback({
  album,
  communitySummary,
}: AlbumReviewExperienceProps) {
  return (
    <>
      <AlbumDetailsColumn album={album} communitySummary={communitySummary}>
        <ReviewFormSkeleton />
      </AlbumDetailsColumn>
      <AlbumTracklist album={album} />
    </>
  );
}

/**
 * Authenticated review view that keeps the log card and tracklist in sync.
 */
function AuthenticatedAlbumReviewExperience({
  album,
  communitySummary,
}: AlbumReviewExperienceProps) {
  const { review } = useUserAlbumReview(album.id);
  const reviewForm = useReviewForm({
    album,
    existingReview: review,
  });

  return (
    <>
      <AlbumDetailsColumn album={album} communitySummary={communitySummary}>
        <AlbumLogCard album={album} reviewForm={reviewForm} />
      </AlbumDetailsColumn>
      <AlbumTracklist
        album={album}
        favoriteTrackId={reviewForm.favoriteTrackId}
        onFavoriteTrackChange={reviewForm.setFavoriteTrackId}
      />
    </>
  );
}

/**
 * Coordinates the album review area for authenticated and anonymous users.
 * Keeps the tracklist visible for everyone while only enabling favorite-song
 * selection for signed-in listeners.
 */
export function AlbumReviewExperience({
  album,
  communitySummary,
}: AlbumReviewExperienceProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ReviewExperienceFallback
        album={album}
        communitySummary={communitySummary}
      />
    );
  }

  if (!user) {
    return (
      <>
        <AlbumDetailsColumn album={album} communitySummary={communitySummary}>
          <LoginPromptCard />
        </AlbumDetailsColumn>
        <AlbumTracklist album={album} />
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <ReviewExperienceFallback
          album={album}
          communitySummary={communitySummary}
        />
      }
    >
      <AuthenticatedAlbumReviewExperience
        album={album}
        communitySummary={communitySummary}
      />
    </Suspense>
  );
}
