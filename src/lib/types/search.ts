/**
 * Represents an artist in search results from Spotify.
 */
export interface SearchArtist {
  id: string
  name: string
  image: string | null
  followers: number
  type: 'artist'
}

/**
 * Represents an album in search results from Spotify.
 */
export interface SearchAlbum {
  id: string
  name: string
  artist: string
  image: string | null
  release_date: string
  type: 'album'
}

/**
 * A union type representing either an artist or album search result.
 */
export type SearchResult = SearchArtist | SearchAlbum

/**
 * The response structure from the Spotify search API.
 */
export interface SearchResponse {
  artists: SearchArtist[]
  albums: SearchAlbum[]
}
