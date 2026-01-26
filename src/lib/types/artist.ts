/**
 * Represents a Spotify artist with their basic profile information.
 */
export interface Artist {
  id: string;
  name: string;
  image: string | null;
  external_url: string;
}
