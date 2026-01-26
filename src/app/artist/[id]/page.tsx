import Link from "next/link";
import { getArtist } from "@/lib/spotify/getArtist";
import { getArtistAlbums } from "@/lib/spotify/getArtistAlbums";

/**
 * Displays the artist page containing:
 * - Artist details (name, image)
 * - Grid of albums by the artist
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtist(id);
  const albums = await getArtistAlbums(id);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Artist Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="w-48 h-48 rounded-full object-cover shadow-lg"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-lg">No Image</span>
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold">{artist.name}</h1>
          <p className="text-muted-foreground mt-2">
            {albums.length} {albums.length === 1 ? "release" : "releases"}
          </p>
        </div>
      </div>

      {/* Albums Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Discography</h2>
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
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
