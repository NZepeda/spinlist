import { useQuery } from "@tanstack/react-query";
import { getAlbums } from "@/lib/actions/getAlbums";
import { useSpotifyToken } from "./useSpotifyToken";

/**
 * A hook that can be used to query Spotify for albums.
 */
export const useAlbums = (query: string) => {
  const { data: tokenData } = useSpotifyToken();

  const token = tokenData?.token;

  const { data, isLoading, error } = useQuery({
    queryKey: ["albums", query],
    queryFn: () => getAlbums(query, token),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: { albums: [] },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const albums = (data?.albums?.items ?? []).filter(
    // @ts-expect-error The Spotify API return types are not fully typed yet.
    (album) => album.album_type === "album"
  );

  return { albums, isLoading, error };
};
