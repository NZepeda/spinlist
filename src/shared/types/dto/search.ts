/**
 * Represents an artist in search results returned by the API route.
 */
export interface SearchArtistDTO {
  id: string;
  name: string;
  imageUrl: string | null;
  type: "artist";
}

/**
 * Represents an album in search results returned by the API route.
 */
export interface SearchAlbumDTO {
  id: string;
  name: string;
  artistName: string;
  imageUrl: string | null;
  releaseDate: string;
  type: "album";
}

/**
 * A union type representing either an artist or album search result.
 */
export type SearchResultDTO = SearchArtistDTO | SearchAlbumDTO;

/**
 * The response structure from the Spotify search API route.
 */
export interface SearchResponseDTO {
  artists: SearchArtistDTO[];
  albums: SearchAlbumDTO[];
}
