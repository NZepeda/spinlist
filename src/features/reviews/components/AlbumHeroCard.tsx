import type { ReactNode } from "react";
import type { Album } from "@/shared/types";
import type { AlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";

interface AlbumHeroCardProps {
  album: Album;
  actionArea: ReactNode;
  communitySummary: AlbumCommunitySummary;
}

interface AlbumStatChipProps {
  label: string;
  value: string;
}

/**
 * Formats the album release year for the hero identity block.
 */
function formatReleaseYear(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }

  return new Date(releaseDate).getFullYear().toString();
}

/**
 * Formats the community average for the hero summary chips.
 */
function formatAverageChip(summary: AlbumCommunitySummary): string {
  if (summary.averageRating === null) {
    return "No ratings yet";
  }

  return `${summary.averageRating.toFixed(1)} avg`;
}

/**
 * Displays one compact album fact without competing with the primary action.
 */
function AlbumStatChip({ label, value }: AlbumStatChipProps) {
  return (
    <div className="min-w-[7rem] rounded-[1.1rem] border border-border/70 bg-background/70 px-4 py-2 backdrop-blur sm:rounded-full">
      <div className="text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

/**
 * Renders the album identity and primary action container that lead the page.
 */
export function AlbumHeroCard({
  album,
  actionArea,
  communitySummary,
}: AlbumHeroCardProps) {
  const releaseYear = formatReleaseYear(album.release_date);

  return (
    <section
      aria-label="Album overview"
      className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/95 p-4 shadow-[0_24px_80px_var(--brand-shadow-soft)] backdrop-blur sm:p-6 xl:rounded-[2rem] xl:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[var(--brand-tint-soft)]" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] xl:items-start xl:gap-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-foreground-muted">
              Album log
            </p>
            <h1 className="mt-3 text-[2.4rem] font-black tracking-tight text-foreground sm:text-5xl">
              {album.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
              {album.artist}
              {releaseYear ? `, ${releaseYear}` : ""}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground-muted">
              Start with a rating, then dig into what the community is hearing
              before you browse the full album details.
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
            <AlbumStatChip
              label="Tracks"
              value={album.tracks.length.toString()}
            />
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
                {communitySummary.standoutTrack.percentage}% of favorite-song
                picks currently land here.
              </p>
            </div>
          ) : null}
        </div>
        <div className="w-full xl:justify-self-end">{actionArea}</div>
      </div>
    </section>
  );
}
