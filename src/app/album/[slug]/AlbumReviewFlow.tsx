"use client";

import type { ReactNode } from "react";
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

interface AlbumReviewFlowProps {
  album: Album;
  communitySummary: AlbumCommunitySummaryData;
}

interface AlbumMetadataProps {
  album: Album;
  communitySummary: AlbumCommunitySummaryData;
}

interface AlbumDetailsColumnProps {
  album: Album;
  children: ReactNode;
  communitySummary: AlbumCommunitySummaryData;
}

/**
 * Formats the album release year for the metadata block.
 */
function formatReleaseYear(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }

  return new Date(releaseDate).getFullYear().toString();
}

/**
 * Formats the community average for the album hero chips.
 */
function formatAverageChip(summary: AlbumCommunitySummaryData): string {
  if (summary.averageRating === null) {
    return "No ratings yet";
  }

  return `${summary.averageRating.toFixed(1)} avg`;
}

interface AlbumStatChipProps {
  label: string;
  value: string;
}

/**
 * Displays a compact album fact in the hero area.
 */
function AlbumStatChip({ label, value }: AlbumStatChipProps) {
  return (
    <div className="rounded-full border border-border/70 bg-background/70 px-4 py-2 backdrop-blur">
      <div className="text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

/**
 * Renders the album metadata and supporting context for the hero area.
 */
function AlbumMetadata({ album, communitySummary }: AlbumMetadataProps) {
  const releaseYear = formatReleaseYear(album.release_date);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-foreground-muted">
          Log this album
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          {album.title}
        </h1>
        <p className="mt-3 text-xl text-muted-foreground">
          {album.artist}
          {releaseYear ? `, ${releaseYear}` : ""}
        </p>
        <p className="mt-2 text-base text-muted-foreground">
          {album.label ? album.label : "Unknown label"}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-muted">
          Rate it, pick the song you came back to, and leave a note if it earned
          one.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <AlbumStatChip
          label="Community"
          value={formatAverageChip(communitySummary)}
        />
        <AlbumStatChip
          label="Logs"
          value={communitySummary.reviewCount.toString()}
        />
        <AlbumStatChip label="Tracks" value={album.tracks.length.toString()} />
      </div>

      {communitySummary.availability === "available" &&
      communitySummary.standoutTrack ? (
        <div className="max-w-xl rounded-2xl border border-border/70 bg-background/60 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-foreground-muted">
            Community pick
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {communitySummary.standoutTrack.trackName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {communitySummary.standoutTrack.percentage}% of favorite-song picks
            currently land here.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders the shared album hero used across auth states.
 */
function AlbumDetailsColumn({
  album,
  children,
  communitySummary,
}: AlbumDetailsColumnProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/95 p-6 shadow-[0_24px_80px_var(--brand-shadow-soft)] backdrop-blur sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[var(--brand-tint-soft)]" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] xl:items-start">
        <AlbumMetadata album={album} communitySummary={communitySummary} />
        <div className="w-full xl:justify-self-end">{children}</div>
      </div>
    </section>
  );
}

/**
 * Fallback UI while the current user's saved album log is loading.
 */
function ReviewFlowFallback({ album, communitySummary }: AlbumReviewFlowProps) {
  return (
    <>
      <AlbumDetailsColumn album={album} communitySummary={communitySummary}>
        <ReviewFormSkeleton />
      </AlbumDetailsColumn>
      <div className="lg:col-span-2">
        <AlbumCommunitySummary summary={communitySummary} />
      </div>
      <AlbumTracklist album={album} />
    </>
  );
}

/**
 * Authenticated review view that keeps the log card and tracklist in sync.
 */
function AuthenticatedAlbumReviewFlow({
  album,
  communitySummary,
}: AlbumReviewFlowProps) {
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
      <div className="lg:col-span-2">
        <AlbumCommunitySummary summary={communitySummary} />
      </div>
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
export function AlbumReviewFlow({
  album,
  communitySummary,
}: AlbumReviewFlowProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ReviewFlowFallback album={album} communitySummary={communitySummary} />
    );
  }

  if (!user) {
    return (
      <>
        <AlbumDetailsColumn album={album} communitySummary={communitySummary}>
          <LoginPromptCard />
        </AlbumDetailsColumn>
        <div className="lg:col-span-2">
          <AlbumCommunitySummary summary={communitySummary} />
        </div>
        <AlbumTracklist album={album} />
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <ReviewFlowFallback album={album} communitySummary={communitySummary} />
      }
    >
      <AuthenticatedAlbumReviewFlow
        album={album}
        communitySummary={communitySummary}
      />
    </Suspense>
  );
}
