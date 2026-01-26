import { notFound } from "next/navigation";
import { Artist } from "@/lib/types/artist";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getLargestImageUrl } from "./getLargestImageUrl";

/**
 * Fetches an artist's details from the Spotify API.
 *
 * @param id - The Spotify artist ID
 * @returns A promise that resolves to the Artist object
 * @throws Calls notFound() for 404 responses, throws Error for other failures
 */
export async function getArtist(id: string): Promise<Artist> {
  const accessToken = await getSpotifyToken();

  const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch artist from Spotify API");
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    image: getLargestImageUrl(data.images),
    external_url: data.external_urls?.spotify || "",
  };
}
