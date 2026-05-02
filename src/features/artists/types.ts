import type { AlbumSummaryDTO } from "@/shared/types";

/**
 * Artist profile with their full release group discography.
 */
export interface ArtistDiscography {
  name: string;
  imageUrl: string | null;
  slug: string;
  albums: AlbumSummaryDTO[];
}
