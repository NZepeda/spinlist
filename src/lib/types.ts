export interface SearchArtist {
  id: string
  name: string
  image: string | null
  followers: number
  type: 'artist'
}

export interface SearchAlbum {
  id: string
  name: string
  artist: string
  image: string | null
  release_date: string
  type: 'album'
}

export type SearchResult = SearchArtist | SearchAlbum

export interface SearchResponse {
  artists: SearchArtist[]
  albums: SearchAlbum[]
}