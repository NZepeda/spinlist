import type { Json } from "@/server/database";

interface AlbumCandidateRecord {
  images: Json;
  tracklist: Json;
}

/**
 * Checks whether an album has at least one track in its tracklist.
 */
function hasTracklistEntries(album: AlbumCandidateRecord): boolean {
  return Array.isArray(album.tracklist) && album.tracklist.length > 0;
}

/**
 * Checks whether an album has at least one image.
 */
function hasImageEntries(album: AlbumCandidateRecord): boolean {
  return Array.isArray(album.images) && album.images.length > 0;
}

/**
 * Picks the album that best represents a release group for display purposes.
 * Prefers albums with a tracklist, then albums with images, then falls back to the first album.
 */
export function selectRepresentativeAlbum<T extends AlbumCandidateRecord>(
  albums: T[],
): T | undefined {
  if (albums.length === 1) {
    return albums[0];
  }

  const withTracks = albums.find((album) => hasTracklistEntries(album));

  if (withTracks) {
    return withTracks;
  }

  const withImages = albums.find((album) => hasImageEntries(album));

  if (withImages) {
    return withImages;
  }

  return albums[0];
}
