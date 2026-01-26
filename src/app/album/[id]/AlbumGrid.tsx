import { Album } from "@/lib/types/album";
import Link from "next/link";

/**
 * Displays the given `albums` in a responsive grid layout.
 */
export const AlbumGrid = ({ albums }: { albums: Album[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/album/${album.id}`}
          className="group block"
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
        </Link>
      ))}
    </div>
  );
};
