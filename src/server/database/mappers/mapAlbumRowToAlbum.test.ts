import { describe, expect, it } from "vitest";
import { mapAlbumRowToAlbum } from "./mapAlbumRowToAlbum";
import type { AlbumRow } from "@/server/database";

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
    title: "Discovery",
    tracks: [],
    ...overrides,
  };
}

describe("mapAlbumRowToAlbum", () => {
  it("maps valid track payloads into the domain model", () => {
    const album = mapAlbumRowToAlbum(
      createAlbumRow({
        tracks: [
          {
            duration_ms: 345000,
            id: "track-1",
            name: "One More Time",
            track_number: 1,
          },
        ],
      }),
    );

    expect(album.tracks).toEqual([
      {
        duration_ms: 345000,
        id: "track-1",
        name: "One More Time",
        track_number: 1,
      },
    ]);
  });

  it("ignores invalid image and track payloads", () => {
    const album = mapAlbumRowToAlbum(
      createAlbumRow({
        images: [null, { url: "https://cdn.example.com/cover.jpg", width: 640 }],
        tracks: [
          {
            duration_ms: 345000,
            id: "track-1",
            name: "One More Time",
            track_number: 1,
          },
          {
            duration_ms: "345000",
            id: "track-2",
            name: "Aerodynamic",
            track_number: 2,
          },
        ],
      }),
    );

    expect(album.images).toEqual([
      {
        height: undefined,
        url: "https://cdn.example.com/cover.jpg",
        width: 640,
      },
    ]);
    expect(album.tracks).toEqual([
      {
        duration_ms: 345000,
        id: "track-1",
        name: "One More Time",
        track_number: 1,
      },
    ]);
  });
});
