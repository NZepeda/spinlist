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
  name: string;
  artist: string;
  image: string | null;
  release_date: string;
  total_tracks: number;
  tracks?: Track[];
}
