import { useQuery } from "@tanstack/react-query";

import { getAlbum } from "../actions/getAlbum";
import { useSpotifyToken } from "./useSpotifyToken";

/**
 * A hook that can be used to get an album from Spotify.
 */
export const useAlbum = (albumId: string) => {
  const { data: tokenData } = useSpotifyToken();

  const token = tokenData?.token;

  return useQuery({
    queryKey: ["album", albumId],
    queryFn: () => getAlbum(albumId, token),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 20, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
