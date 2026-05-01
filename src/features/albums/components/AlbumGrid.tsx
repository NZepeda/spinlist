"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AlbumSummaryDTO } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

interface AlbumGridProps {
  albums: AlbumSummaryDTO[];
}

/**
 * Displays the given `albums` in a responsive grid layout.
 */
export const AlbumGrid = ({ albums }: AlbumGridProps) => {
  const router = useRouter();
  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Resolves the selected album to a slug-backed route and navigates to it.
   *
   * @param albumId - The Spotify album identifier from the artist discography payload.
   */
  const handleAlbumClick = async (albumId: string) => {
    setLoadingAlbumId(albumId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/slug?spotifyId=${albumId}&type=album`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to resolve album slug");
      }

      const data = (await response.json()) as { slug: string };

      if (typeof data.slug !== "string" || data.slug.length === 0) {
        throw new Error("Album slug response was invalid");
      }

      router.push(`/album/${data.slug}`);
    } catch {
      setErrorMessage(
        "We couldn't open that album yet. Please try again in a moment.",
      );
    } finally {
      setLoadingAlbumId(null);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <p
          className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
        {albums.map((album) => {
          const isLoading = loadingAlbumId === album.id;

          return (
            <button
              type="button"
              className={cn(
                "group block rounded-2xl p-1 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isLoading && "opacity-70",
              )}
              disabled={Boolean(loadingAlbumId)}
              onClick={() => {
                void handleAlbumClick(album.id);
              }}
              key={album.id}
            >
              <div className="mb-3 aspect-square overflow-hidden rounded-[1.35rem]">
                {album.imageUrl ? (
                  <img
                    src={album.imageUrl}
                    alt={album.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">
                      No Image
                    </span>
                  </div>
                )}
              </div>
              <h3 className="truncate font-medium group-hover:underline">
                {album.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Opening..."
                  : new Date(album.releaseDate).getFullYear()}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
