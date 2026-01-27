"use client";

import { getOrCreateAlbumSlug } from "@/lib/slugs/getOrCreateAlbumSlug";
import { createClient } from "@/lib/supabase/client";
import { Album } from "@/lib/types/album";
import { useRouter } from "next/navigation";

/**
 * Displays the given `albums` in a responsive grid layout.
 */
export const AlbumGrid = ({
  artist,
  albums,
}: {
  artist: string;
  albums: Album[];
}) => {
  const router = useRouter();
  const handleAlbumClick = async (album: Album) => {
    // Get the slug for the album and navigate to its page
    // This logic can be implemented here if needed
    const supabase = await createClient();
    const slug = await getOrCreateAlbumSlug(supabase, {
      spotify_id: album.id,
      title: album.name,
      artist,
    });

    router.push(`/album/${slug}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {albums.map((album) => (
        <div
          className="group block"
          onClick={() => handleAlbumClick(album)}
          key={album.id}
        >
          <div className="aspect-square mb-3 overflow-hidden rounded-lg">
            {album.image ? (
              <img
                src={album.image}
                alt={album.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No Image</span>
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
      ))}
    </div>
  );
};
