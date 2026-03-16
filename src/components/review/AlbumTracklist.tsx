import { Button } from "@/components/ui-core/button";
import { cn } from "@/lib/cn";
import type { Album } from "@/lib/types";

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
    <section className="rounded-[2rem] border border-border/70 bg-surface/95 p-6 shadow-[0_20px_60px_var(--brand-shadow-soft)] backdrop-blur sm:p-8 lg:col-span-2">
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
            "flex w-full items-center gap-4 rounded-xl p-3 transition-colors",
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
                  "text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                aria-pressed={isSelected}
                onClick={() => {
                  onFavoriteTrackChange(isSelected ? "" : track.id);
                }}
              >
                <span className="text-muted-foreground font-medium w-8">
                  {index + 1}.
                </span>
                <span className="flex-1 font-medium">{track.name}</span>
                {isSelected ? (
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
                    Your pick
                  </span>
                ) : null}
                <span className="text-muted-foreground text-sm">
                  {formatDuration(track.duration_ms)}
                </span>
              </button>
            );
          }

          return (
            <div key={track.id} className={rowClassName}>
              <span className="text-muted-foreground font-medium w-8">
                {index + 1}.
              </span>
              <span className="flex-1 font-medium">{track.name}</span>
              <span className="text-muted-foreground text-sm">
                {formatDuration(track.duration_ms)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
