import type { Json } from "@/server/database";
import type {
  AlbumRecord,
  AlbumRecordTrack,
} from "@/shared/types/domain/album";
import { parseAlbumImages } from "./parseAlbumImages";

interface AlbumArtistRecordData {
  id: string;
  name: string;
  slug: string;
}

interface AlbumRecordData {
  artists: AlbumArtistRecordData[];
  id: string;
  images: Json;
  slug: string;
  title: string;
  tracklist: Json;
}

/**
 * Extracts valid track records from untyped JSON data.
 */
function parseAlbumTracks(tracklist: Json): AlbumRecordTrack[] {
  const rawTracks = Array.isArray(tracklist) ? tracklist : [];

  return rawTracks.flatMap((track) => {
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
}

/**
 * Maps assembled album data into the canonical album model.
 */
export function mapAlbumRowToAlbum(album: AlbumRecordData): AlbumRecord {
  const artists = album.artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
  }));
  const images = parseAlbumImages(album.images);
  const tracks = parseAlbumTracks(album.tracklist);

  return {
    id: album.id,
    artists,
    slug: album.slug,
    title: album.title,
    images,
    tracks,
  };
}
