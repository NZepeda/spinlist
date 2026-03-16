import type { Image } from "./image";

export interface AlbumTrack {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
}

export type StreamingPlatform = "spotify" | "apple_music";

export type AlbumStreamingLinks = Partial<Record<StreamingPlatform, string>>;

/**
 * Canonical album model used across the app.
 * Uses snake_case to match existing DB fields until a full normalization pass.
 */
export interface Album {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  label: string;
  slug: string;
  release_date: string | null;
  avg_rating: number | null;
  review_count: number | null;
  images: Image[];
  streaming_links: AlbumStreamingLinks;
  tracks: AlbumTrack[];
}
