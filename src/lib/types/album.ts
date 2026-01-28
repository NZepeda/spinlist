import { Json } from "@/lib/supabase/database.types";

/**
 * Represents an image from Spotify's API.
 * Images are typically provided in multiple sizes (large, medium, small).
 */
export interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

/**
 * Type-safe cast for SpotifyImage array to Supabase Json type.
 */
export function imagesToJson(images: SpotifyImage[]): Json {
  return images as unknown as Json;
}

/**
 * Represents a track within an album.
 */
export interface Track {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
  [key: string]: string | number;
}

/**
 * Represents a complete album with its metadata and track listing.
 */
export interface Album {
  id: string;
  slug?: string;
  name: string;
  artist: string;
  images: SpotifyImage[];
  release_date: string;
  total_tracks: number;
  tracks?: Track[];
}
