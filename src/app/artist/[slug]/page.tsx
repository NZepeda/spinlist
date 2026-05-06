import { startSpan } from "@/monitoring/startSpan";
import { getArtistDiscography } from "@/features/artists/server/getArtistDiscography";
import { AlbumGrid } from "@/features/albums/components/AlbumGrid";
import { AppPage } from "@/shared/ui/AppPage";
import { notFound } from "next/navigation";

/**
 * Displays an artist's discography as a grid of releases.
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return await startSpan(
    {
      name: "page.artist.load",
      op: "ui.page",
    },
    async () => {
      const { slug } = await params;

      const discography = await getArtistDiscography(slug);

      if (!discography) {
        notFound();
      }

      const {
        name: artistName,
        imageUrl: artistImageUrl,
        albums,
      } = discography;

      return (
        <AppPage>
          {/* Artist Header */}
          <div className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {artistImageUrl ? (
              <img
                src={artistImageUrl}
                alt={artistName}
                className="h-32 w-32 rounded-full object-cover shadow-lg sm:h-40 sm:w-40 md:h-48 md:w-48"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted sm:h-40 sm:w-40 md:h-48 md:w-48">
                <span className="text-muted-foreground text-lg">No Image</span>
              </div>
            )}
            <div className="text-left">
              <h1 className="text-3xl font-bold sm:text-4xl">{artistName}</h1>
              <p className="text-muted-foreground mt-2">
                {albums.length} {albums.length === 1 ? "release" : "releases"}
              </p>
            </div>
          </div>

          <section>
            <h2 className="mb-6 text-2xl font-bold">Discography</h2>
            <AlbumGrid albums={albums} />
          </section>
        </AppPage>
      );
    },
  );
}
