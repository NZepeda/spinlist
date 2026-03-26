import { notFound } from "next/navigation";

import { getImageUrl } from "@/server/spotify/getImageUrl";
import { getAlbum } from "@/features/albums/server/getAlbum";
import { AlbumPageShell } from "@/features/reviews/components/AlbumPageShell";
import { getAlbumCommunitySummary } from "@/features/reviews/server/getAlbumCommunitySummary";
import { getAlbumReviewFeed } from "@/features/reviews/server/getAlbumReviewFeed";
import { AlbumReviewFlow } from "@/features/reviews/components/AlbumReviewFlow";

/**
 * Album page displaying information about the Album.
 * If the user is logged in, it displays the review form.
 * Otherwise, prompts the user to log in.
 */
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
      primaryAction={<AlbumReviewFlow album={album} />}
      reviewFeed={reviewFeed}
    />
  );
}
