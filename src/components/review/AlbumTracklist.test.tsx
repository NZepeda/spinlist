import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Album } from "@/lib/types";
import { render } from "@/test/utils/render";
import { AlbumTracklist } from "./AlbumTracklist";

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

describe("AlbumTracklist", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls onFavoriteTrackChange with the clicked track id", async () => {
    const user = userEvent.setup();
    const onFavoriteTrackChange = vi.fn<(trackId: string) => void>();

    render(
      <AlbumTracklist
        album={mockAlbum}
        favoriteTrackId=""
        onFavoriteTrackChange={onFavoriteTrackChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /bodysnatchers/i }));

    expect(onFavoriteTrackChange).toHaveBeenCalledWith("track-2");
  });

  it("clears the current favorite when the selected track is clicked again", async () => {
    const user = userEvent.setup();
    const onFavoriteTrackChange = vi.fn<(trackId: string) => void>();

    render(
      <AlbumTracklist
        album={mockAlbum}
        favoriteTrackId="track-2"
        onFavoriteTrackChange={onFavoriteTrackChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /bodysnatchers/i }));

    expect(onFavoriteTrackChange).toHaveBeenCalledWith("");
  });

  it("shows a visible badge for the selected favorite track", () => {
    render(
      <AlbumTracklist
        album={mockAlbum}
        favoriteTrackId="track-2"
        onFavoriteTrackChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Your pick")).toHaveLength(1);
  });
});
