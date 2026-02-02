"use client";

import { getImageUrl } from "@/lib/spotify/getImageUrl";
import { useRouter } from "next/navigation";
import { SpotifyAlbumSimplified } from "@/lib/types/spotify.types";

/**
 * Displays the given `albums` in a responsive grid layout.
 */
export const AlbumGrid = ({
  albums,
}: {
  artist: string;
  albums: SpotifyAlbumSimplified[];
}) => {
  const router = useRouter();
  const handleAlbumClick = async (albumId: string) => {
    const slug = await fetch(`/api/slug/spotifyId=${albumId}&type=album`);

    router.push(`/album/${slug}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {albums.map((album) => {
        const imageUrl = getImageUrl(album.images, "medium");
        return (
          <div
            className="group block"
            onClick={() => handleAlbumClick(album.id)}
            key={album.id}
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-lg">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={album.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    No Image
                  </span>
                </div>
              )}
            </div>
            <h3 className="font-medium truncate group-hover:underline">
              {album.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {album.release_date.slice(0, 4)}
            </p>
          </div>
        );
      })}
    </div>
  );
};
