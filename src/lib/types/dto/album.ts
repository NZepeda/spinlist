import type { Image } from "@/lib/types/domain/image";

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
}
