import Link from "next/link";
import { AlbumTracklist } from "@/features/reviews/components/AlbumTracklist";
import { Button } from "@/shared/ui/button";
import type {
  Album,
  AlbumStreamingLinks,
  StreamingPlatform,
} from "@/shared/types";

interface AlbumReadOnlyMetadataProps {
  album: Album;
}

interface MetadataFieldProps {
  label: string;
  value: string;
}

interface StreamingLinkDefinition {
  label: string;
  platform: StreamingPlatform;
}

const STREAMING_LINK_DEFINITIONS: StreamingLinkDefinition[] = [
  {
    label: "Spotify",
    platform: "spotify",
  },
  {
    label: "Apple Music",
    platform: "apple_music",
  },
];

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
 * Returns the streaming links that are available for the current album.
 */
function getAvailableStreamingLinks(
  streamingLinks: AlbumStreamingLinks,
): Array<{ href: string; label: string }> {
  return STREAMING_LINK_DEFINITIONS.flatMap((definition) => {
    const href = streamingLinks[definition.platform];

    if (!href) {
      return [];
    }

    return [
      {
        href,
        label: definition.label,
      },
    ];
  });
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
  const streamingLinks = getAvailableStreamingLinks(album.streaming_links);

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

        {streamingLinks.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {streamingLinks.map((streamingLink) => (
              <Button key={streamingLink.href} variant="outline" asChild>
                <Link
                  href={streamingLink.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in {streamingLink.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <AlbumTracklist album={album} />
    </section>
  );
}
