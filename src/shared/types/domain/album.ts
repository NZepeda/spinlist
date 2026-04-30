import type { Image } from "./image";

export interface AlbumRecordArtist {
  id: string;
  name: string;
  slug: string;
}

export interface AlbumRecordTrack {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
}

/**
 * Canonical album record with artist credits, cover art, and track details.
 */
export interface AlbumRecord {
  id: string;
  artists: AlbumRecordArtist[];
  images: Image[];
  slug: string;
  title: string;
  tracks: AlbumRecordTrack[];
}
