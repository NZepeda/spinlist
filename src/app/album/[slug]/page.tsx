import { notFound } from "next/navigation";

import { startSpan } from "@/monitoring/startSpan";
import { getImageUrl } from "@/server/spotify/getImageUrl";
import { getAlbum } from "@/features/albums/server/getAlbum";
import { AlbumPageShell } from "@/features/reviews/components/AlbumPageShell";
import { getAlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";
import { getAlbumReviewFeed } from "@/features/reviews/server/getAlbumReviewFeed";

/**
 * Displays the selected album with its community context and review experience.
 */
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return await startSpan(
    {
      name: "page.album.load",
      op: "ui.page",
    },
    async () => {
      const { slug } = await params;

      const album = await getAlbum(slug);

      if (!album) {
        notFound();
      }

      const imageUrl = getImageUrl(album.images, "large");
      const [communitySummary, reviewFeed] = await Promise.all([
        getAlbumCommunitySummary(album),
        getAlbumReviewFeed(album),
      ]);

  return (
    <AlbumPageShell
      album={album}
      communitySummary={communitySummary}
      imageUrl={imageUrl}
      reviewFeed={reviewFeed}
    />
  );
}
