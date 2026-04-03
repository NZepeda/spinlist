import { SpotifyDependencyError } from "@/server/spotify/SpotifyDependencyError";

/**
 * Translates Spotify dependency failures into safe route-level context and tags so API handlers can report upstream issues without coupling to error internals.
 *
 * @param error - The error thrown by Spotify-backed code.
 * @returns Safe context and tags derived from the Spotify error when available.
 */
export function getSpotifyErrorMetadata(error: unknown): {
  context?: Record<string, number | string | null>;
  tags?: Record<string, string>;
} {
  if (!(error instanceof SpotifyDependencyError)) {
    return {};
  }

  return {
    context: {
      spotifyOperation: error.operation,
      spotifyResource: error.resource,
      spotifyStatus: error.status ?? null,
    },
    tags: {
      dependency: error.dependency,
      spotifyOperation: error.operation,
    },
  };
}
