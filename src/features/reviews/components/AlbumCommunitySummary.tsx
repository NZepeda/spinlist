import type { ReactNode } from "react";
import type { AlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";

interface AlbumCommunitySummaryProps {
  summary: AlbumCommunitySummary;
}

interface AlbumCommunitySummaryContentProps {
  children: ReactNode;
  summary: AlbumCommunitySummary;
}

/**
 * Formats the average rating for compact display in the album summary.
 */
function formatAverageRating(averageRating: number | null): string {
  if (averageRating === null) {
    return "No ratings yet";
  }

  return averageRating.toFixed(1);
}

/**
 * Renders the shared card frame and header for community-summary content.
 */
function AlbumCommunitySummaryContent({
  children,
  summary,
}: AlbumCommunitySummaryContentProps) {
  return (
    <section
      aria-label="Community summary"
      className="rounded-[1.75rem] border border-border/70 bg-card/95 p-4 shadow-[0_18px_40px_var(--brand-shadow-soft)] md:p-5"
    >
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Community snapshot</h2>
          <p className="text-sm text-muted-foreground">
            See how other listeners rated this album and which song keeps
            showing up as the standout.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 text-sm sm:w-auto sm:min-w-[12rem]">
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <div className="text-muted-foreground">Average</div>
            <div className="mt-1 text-2xl font-semibold">
              {formatAverageRating(summary.averageRating)}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <div className="text-muted-foreground">Logs</div>
            <div className="mt-1 text-2xl font-semibold">
              {summary.reviewCount}
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Renders album-level community rating and favorite-song data.
 */
export function AlbumCommunitySummary({
  summary,
}: AlbumCommunitySummaryProps) {
  const histogramMax = Math.max(
    ...summary.ratingHistogram.map((bucket) => bucket.count),
    0,
  );

  if (summary.availability === "unavailable") {
    return (
      <AlbumCommunitySummaryContent summary={summary}>
        <div className="rounded-xl border border-dashed bg-background/40 p-4 text-sm text-muted-foreground">
          Community details are temporarily unavailable. Album-level stats may
          still appear here while the full breakdown reloads.
        </div>
      </AlbumCommunitySummaryContent>
    );
  }

  if (summary.reviewCount === 0) {
    return (
      <AlbumCommunitySummaryContent summary={summary}>
        <div className="rounded-xl border border-dashed bg-background/40 p-4 text-sm text-muted-foreground">
          No community data yet. The first few reviews will set the tone here.
        </div>
      </AlbumCommunitySummaryContent>
    );
  }

  return (
    <AlbumCommunitySummaryContent summary={summary}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Rating spread
          </h3>
          <div className="space-y-2">
            {summary.ratingHistogram
              .slice()
              .reverse()
              .map((bucket) => {
                const widthPercentage =
                  histogramMax > 0
                    ? Math.max((bucket.count / histogramMax) * 100, 6)
                    : 0;

                return (
                  <div
                    key={bucket.rating}
                    className="grid grid-cols-[3rem_minmax(0,1fr)_2rem] items-center gap-2 text-sm sm:gap-3"
                  >
                    <span className="text-muted-foreground">
                      {bucket.rating.toFixed(1)}
                    </span>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-brand transition-[width]"
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                    <span className="text-right text-muted-foreground">
                      {bucket.count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
          <h3 className="text-sm font-medium text-foreground">
            Standout track
          </h3>
          {summary.standoutTrack ? (
            <>
              <div className="text-base font-semibold">
                {summary.standoutTrack.trackName}
              </div>
              <p className="text-sm text-muted-foreground">
                Picked by {summary.standoutTrack.percentage}% of listeners who
                chose a favorite song.
              </p>
              <div className="space-y-2">
                {summary.favoriteTracks.slice(0, 3).map((track) => (
                  <div
                    key={track.trackId}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 flex-1 text-foreground">
                      {track.trackName}
                    </span>
                    <span className="text-muted-foreground">
                      {track.count} picks
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Favorite-song picks will show up here once listeners start
              logging this album.
            </p>
          )}
        </div>
      </div>
    </AlbumCommunitySummaryContent>
  );
}
