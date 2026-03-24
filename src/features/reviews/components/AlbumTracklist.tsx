import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
import type { Album } from "@/shared/types";

interface AlbumTracklistProps {
  album: Album;
  favoriteTrackId?: string;
  onFavoriteTrackChange?: (trackId: string) => void;
}

/**
 * Formats a track duration from milliseconds into mm:ss.
 */
function formatDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Renders the album tracklist and optionally allows the user to mark a track
 * as their favorite by clicking the row.
 */
export function AlbumTracklist({
  album,
  favoriteTrackId = "",
  onFavoriteTrackChange,
}: AlbumTracklistProps) {
  const isInteractive = Boolean(onFavoriteTrackChange);

  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-surface/95 p-4 shadow-[0_20px_60px_var(--brand-shadow-soft)] backdrop-blur sm:p-6 lg:col-span-2 xl:rounded-[2rem] xl:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tracklist</h2>
          <p className="text-sm text-muted-foreground">
            {isInteractive
              ? "Tap a song to mark it as your favorite."
              : "Browse the full album tracklist."}
          </p>
        </div>
        {isInteractive && favoriteTrackId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onFavoriteTrackChange?.("");
            }}
          >
            Clear pick
          </Button>
        ) : null}
      </div>
      <div className="space-y-2">
        {album.tracks.map((track, index) => {
          const isSelected = track.id === favoriteTrackId;
          const rowClassName = cn(
            "flex w-full items-start gap-3 rounded-[1.25rem] p-3.5 text-left transition-colors md:items-center md:gap-4",
            isInteractive ? "hover:bg-background/70" : "bg-transparent",
            isSelected &&
              "border border-foreground/15 bg-[var(--brand-tint-soft)] shadow-[0_12px_24px_var(--brand-shadow-soft)]",
          );

          if (isInteractive && onFavoriteTrackChange) {
            return (
              <button
                key={track.id}
                type="button"
                className={cn(
                  rowClassName,
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                aria-pressed={isSelected}
                onClick={() => {
                  onFavoriteTrackChange(isSelected ? "" : track.id);
                }}
              >
                <span className="w-8 pt-0.5 font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <span className="block font-medium">{track.name}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDuration(track.duration_ms)}</span>
                    {isSelected ? (
                      <span className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
                        Your pick
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          }

          return (
            <div key={track.id} className={rowClassName}>
              <span className="w-8 pt-0.5 font-medium text-muted-foreground">
                {index + 1}.
              </span>
              <div className="flex-1">
                <span className="block font-medium">{track.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
