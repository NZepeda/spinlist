import type { Image } from "@/shared/types/domain/image";

/**
 * Lightweight album summary used for list/grid displays.
 */
export interface AlbumSummaryDTO {
  id: string;
  name: string;
  artistName: string;
  imageUrl: string | null;
  images: Image[];
  releaseDate: string;
  totalTracks: number;
  label: string;
  slug: string;
}
