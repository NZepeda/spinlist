/**
 * Represents a Spotify artist with their basic profile information.
 */
export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
  externalUrl: string;
}
