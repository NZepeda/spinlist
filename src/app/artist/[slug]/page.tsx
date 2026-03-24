import { notFound } from "next/navigation";
import { getArtist } from "@/server/spotify/getArtist";
import { getArtistAlbumsFromSpotify } from "@/server/spotify/getArtistAlbumsFromSpotify";
import { AlbumGrid } from "@/features/albums/components/AlbumGrid";
import { createClient } from "@/server/supabase/server";
import { getSpotifyIdFromSlug } from "@/server/spotify/getSpotifyIdFromSlug";

/**
 * Displays the artist page containing:
 * - Artist details (name, image)
 * - Grid of albums by the artist
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const spotifyId = await getSpotifyIdFromSlug(slug, {
    supabase,
    itemType: "artist",
  });

  if (!spotifyId) {
    notFound();
  }

  const artist = await getArtist(spotifyId);
  const albums = await getArtistAlbumsFromSpotify(spotifyId);

  return (
    <main className="app-shell py-8 md:py-12">
      {/* Artist Header */}
      <div className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="h-32 w-32 rounded-full object-cover shadow-lg sm:h-40 sm:w-40 md:h-48 md:w-48"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted sm:h-40 sm:w-40 md:h-48 md:w-48">
            <span className="text-muted-foreground text-lg">No Image</span>
          </div>
        )}
        <div className="text-left">
          <h1 className="text-3xl font-bold sm:text-4xl">{artist.name}</h1>
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
