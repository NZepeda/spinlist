import { notFound } from "next/navigation";
import type { Artist } from "@/shared/types";
import { getImageUrl } from "./getImageUrl";
import { getSpotifyArtist } from "./getSpotifyArtist";

/**
 * Fetches an artist's details from the Spotify API.
 *
 * @param id - The Spotify artist ID
 * @returns A promise that resolves to the Artist object
 * @throws Calls notFound() for 404 responses, throws Error for other failures
 */
export async function getArtist(id: string): Promise<Artist> {
  const spotifyArtist = await getSpotifyArtist(id);

  if (!spotifyArtist) {
    notFound();
  }

  return {
    externalUrl: spotifyArtist.external_urls?.spotify || "",
    id: spotifyArtist.id,
    imageUrl: getImageUrl(spotifyArtist.images, "medium"),
    name: spotifyArtist.name,
  };
}
