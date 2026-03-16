import { describe, expect, it } from "vitest";
import { mapAlbumRowToAlbum } from "./mapAlbumRowToAlbum";
import type { AlbumRow } from "@/lib/types/db";

/**
 * Builds the smallest valid album row needed to exercise mapper behavior.
 */
function createAlbumRow(overrides: Partial<AlbumRow> = {}): AlbumRow {
  return {
    artist: "Daft Punk",
    avg_rating: 4.5,
    created_at: "2026-01-01T00:00:00.000Z",
    id: "album-1",
    images: [],
    label: "Virgin",
    last_synced_at: "2026-01-01T00:00:00.000Z",
    release_date: "2001-03-12",
    review_count: 10,
    slug: "daft-punk-discovery",
    spotify_id: "spotify-album-1",
    streaming_links: {},
    streaming_links_synced_at: null,
    title: "Discovery",
    tracks: [],
    ...overrides,
  };
}

describe("mapAlbumRowToAlbum", () => {
  it("maps supported streaming link platforms", () => {
    const album = mapAlbumRowToAlbum(
      createAlbumRow({
        streaming_links: {
          spotify: "https://open.spotify.com/album/123",
          apple_music: "https://music.apple.com/us/album/456",
        },
      }),
    );

    expect(album.streaming_links).toEqual({
      spotify: "https://open.spotify.com/album/123",
      apple_music: "https://music.apple.com/us/album/456",
    });
  });

  it("ignores invalid and unsupported streaming link values", () => {
    const album = mapAlbumRowToAlbum(
      createAlbumRow({
        streaming_links: {
          spotify: 123,
          apple_music: "https://music.apple.com/us/album/456",
          youtube_music: "https://music.youtube.com/watch?v=123",
        },
      }),
    );

    expect(album.streaming_links).toEqual({
      apple_music: "https://music.apple.com/us/album/456",
    });
  });
});
