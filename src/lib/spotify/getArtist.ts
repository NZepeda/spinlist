import { notFound } from "next/navigation";
import { Artist } from "@/lib/types/artist";
import { getSpotifyToken } from "@/lib/getSpotifyToken";
import { getImageUrl } from "./getImageUrl";

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

  // TODO: Fix this
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    id: data.id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    name: data.name,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    image: getImageUrl(data.images, "medium"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    external_url: data.external_urls?.spotify || "",
  };
}
