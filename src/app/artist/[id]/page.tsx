import Link from "next/link";
import { getArtist } from "@/lib/spotify/getArtist";
import { getArtistAlbums } from "@/lib/spotify/getArtistAlbums";
import { AlbumGrid } from "@/app/album/[id]/AlbumGrid";

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

      <section>
        <h2 className="text-2xl font-bold mb-6">Discography</h2>
        <AlbumGrid albums={albums} />
      </section>
    </main>
  );
}
