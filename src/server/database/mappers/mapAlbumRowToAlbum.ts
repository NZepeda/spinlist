import type { AlbumRow } from "@/server/database";
import type {
  Album,
  AlbumStreamingLinks,
  AlbumTrack,
  StreamingPlatform,
} from "@/shared/types/domain/album";
import type { Image } from "@/shared/types/domain/image";

const STREAMING_PLATFORMS: StreamingPlatform[] = ["spotify", "apple_music"];

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

  const streamingLinks = mapStreamingLinks(album.streaming_links);

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
    streaming_links: streamingLinks,
    tracks,
  };
}

/**
 * Restricts persisted streaming link payloads to supported platforms and URL strings.
 */
function mapStreamingLinks(rawStreamingLinks: AlbumRow["streaming_links"]): AlbumStreamingLinks {
  if (
    rawStreamingLinks === null ||
    typeof rawStreamingLinks !== "object" ||
    Array.isArray(rawStreamingLinks)
  ) {
    return {};
  }

  const record = rawStreamingLinks as Record<string, unknown>;
  const streamingLinks: AlbumStreamingLinks = {};

  for (const platform of STREAMING_PLATFORMS) {
    const url = record[platform];

    if (typeof url === "string") {
      streamingLinks[platform] = url;
    }
  }

  return streamingLinks;
}
