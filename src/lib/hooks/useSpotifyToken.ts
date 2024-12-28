import { useQuery } from "@tanstack/react-query";

export const useSpotifyToken = () => {
  return useQuery({
    queryKey: ["spotify-token"],
    queryFn: () => fetch("/api/spotify/token").then((res) => res.json()),
    refetchOnWindowFocus: false,
  });
};
