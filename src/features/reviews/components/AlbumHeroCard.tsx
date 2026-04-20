import type { Album } from "@/shared/types";
import type { AlbumCommunitySummary } from "@/features/reviews/types";
import { AlbumReviewFlow } from "./AlbumReviewFlow";

interface AlbumHeroCardProps {
  album: Album;
  communitySummary: AlbumCommunitySummary;
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
 * Renders the album identity and primary action container that lead the page.
 */
export function AlbumHeroCard({ album, communitySummary }: AlbumHeroCardProps) {
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
            <h1 className="mt-3 text-[2.4rem] font-black tracking-tight text-foreground sm:text-5xl">
              {album.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
              {album.artist}
              {releaseYear ? `, ${releaseYear}` : ""}
            </p>
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
        <div className="w-full xl:justify-self-end">
          <AlbumReviewFlow album={album} />
        </div>
      </div>
    </section>
  );
}
