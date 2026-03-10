import type { AlbumRow } from "@/lib/types/db";
import type { Album, AlbumTrack } from "@/lib/types/domain/album";
import type { Image } from "@/lib/types/domain/image";

/**
 * Maps a database album row into the canonical album model.
 */
export function mapAlbumRowToAlbum(album: AlbumRow): Album {
  const rawImages = Array.isArray(album.images) ? album.images : [];
  const images: Image[] = rawImages.flatMap((image) => {
    if (image === null || typeof image !== "object") {
      return [];
    }

    if (Array.isArray(image)) {
      return [];
    }

    const record = image as Record<string, unknown>;

    if (typeof record.url !== "string") {
      return [];
    }

    const height = typeof record.height === "number" ? record.height : undefined;
    const width = typeof record.width === "number" ? record.width : undefined;

    return [
      {
        url: record.url,
        height,
        width,
      },
    ];
  });

  const rawTracks = Array.isArray(album.tracks) ? album.tracks : [];
  const tracks: AlbumTrack[] = rawTracks.flatMap((track) => {
    if (track === null || typeof track !== "object") {
      return [];
    }

    if (Array.isArray(track)) {
      return [];
    }

    const record = track as Record<string, unknown>;

    if (typeof record.id !== "string") {
      return [];
    }

    if (typeof record.name !== "string") {
      return [];
    }

    if (typeof record.track_number !== "number") {
      return [];
    }

    if (typeof record.duration_ms !== "number") {
      return [];
    }

    return [
      {
        id: record.id,
        name: record.name,
        track_number: record.track_number,
        duration_ms: record.duration_ms,
      },
    ];
  });

  return {
    id: album.id,
    spotify_id: album.spotify_id,
    title: album.title,
    artist: album.artist,
    label: album.label,
    slug: album.slug,
    release_date: album.release_date,
    avg_rating: album.avg_rating,
    review_count: album.review_count,
    images,
    tracks,
  };
}
