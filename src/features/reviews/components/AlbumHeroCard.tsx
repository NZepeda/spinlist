import Link from "next/link";
import type { AlbumRecord } from "@/shared/types";
import { AlbumReviewFlow } from "./AlbumReviewFlow";

interface AlbumHeroCardProps {
  album: AlbumRecord;
}

/**
 * Renders the album identity and primary action container that lead the page.
 */
export function AlbumHeroCard({ album }: AlbumHeroCardProps) {
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
              {album.artists.map((artist, index) => (
                <span key={artist.id}>
                  {index > 0 ? ", " : ""}
                  <Link
                    href={`/artist/${artist.slug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {artist.name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="w-full xl:justify-self-end">
          <AlbumReviewFlow album={album} />
        </div>
      </div>
    </section>
  );
}
