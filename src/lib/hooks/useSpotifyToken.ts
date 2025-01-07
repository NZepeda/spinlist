import { useQuery } from "@tanstack/react-query";

/**
 * A hook that can be used to get the Spotify token.
 */
export const useSpotifyToken = () => {
  return useQuery({
    queryKey: ["spotify-token"],
    queryFn: () => fetch("/api/spotify/token").then((res) => res.json()),
    refetchOnWindowFocus: false,
    retry: 3,
    // 1 hour
    staleTime: 3600000,
    gcTime: 3600000,
  });
};
