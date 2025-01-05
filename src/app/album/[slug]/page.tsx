import { Metadata } from "next";
import { AlbumDetails } from "./AlbumDetails";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAlbum } from "@/lib/actions/getAlbum";

export const metadata: Metadata = {
  title: "Album Details | AlbumPulse",
  description: "View album details and reviews",
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const albumId = (await params).slug;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["album"],
    queryFn: () => getAlbum(albumId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto px-4 py-8">
        <AlbumDetails />
      </div>
    </HydrationBoundary>
  );
}
