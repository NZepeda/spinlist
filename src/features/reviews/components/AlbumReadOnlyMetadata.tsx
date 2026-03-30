import { AlbumTracklist } from "@/features/reviews/components/AlbumTracklist";
import type { Album } from "@/shared/types";

interface AlbumReadOnlyMetadataProps {
  album: Album;
}

interface MetadataFieldProps {
  label: string;
  value: string;
}

/**
 * Formats the full album release date for the supporting metadata area.
 */
function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(releaseDate));
}

/**
 * Displays one read-only metadata value without adding interaction noise.
 */
function MetadataField({ label, value }: MetadataFieldProps) {
  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-foreground-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/**
 * Groups low-priority album details below the community and review content.
 */
export function AlbumReadOnlyMetadata({
  album,
}: AlbumReadOnlyMetadataProps) {
  return (
    <section aria-label="Album details" className="space-y-6">
      <div className="rounded-[1.75rem] border border-border/70 bg-surface/95 p-4 shadow-[0_20px_60px_var(--brand-shadow-soft)] backdrop-blur sm:p-6 xl:rounded-[2rem] xl:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-foreground">Album details</h2>
          <p className="text-sm text-muted-foreground">
            Keep the facts close by without pulling focus from rating and
            community activity.
          </p>
        </div>

        <dl className="grid gap-3 md:grid-cols-3">
          <MetadataField
            label="Release date"
            value={formatReleaseDate(album.release_date)}
          />
          <MetadataField
            label="Label"
            value={album.label || "Unknown label"}
          />
          <MetadataField
            label="Track count"
            value={album.tracks.length.toString()}
          />
        </dl>
      </div>

      <AlbumTracklist album={album} />
    </section>
  );
}
