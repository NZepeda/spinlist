import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AlbumReadOnlyMetadata } from "@/features/reviews/components/AlbumReadOnlyMetadata";
import type { Album } from "@/shared/types";
import { render } from "@/shared/test/utils/render";

const mockAlbum: Album = {
  id: "album-1",
  spotify_id: "spotify-album-1",
  title: "In Rainbows",
  artist: "Radiohead",
  label: "XL",
  slug: "radiohead-in-rainbows",
  release_date: "2007-10-10",
  avg_rating: 4.5,
  review_count: 12,
  images: [],
  tracks: [
    { id: "track-1", name: "15 Step", track_number: 1, duration_ms: 237000 },
    {
      id: "track-2",
      name: "Bodysnatchers",
      track_number: 2,
      duration_ms: 242000,
    },
  ],
};

describe("AlbumReadOnlyMetadata", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps the page-level tracklist read-only while showing supporting album details", () => {
    render(<AlbumReadOnlyMetadata album={mockAlbum} />);

    expect(screen.getByText("Album details")).toBeInTheDocument();
    expect(
      screen.getByText("Browse the full album tracklist."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /bodysnatchers/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Track count")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
