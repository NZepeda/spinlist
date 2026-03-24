import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDeferred } from "@/shared/test/utils/createDeferred";
import { createJsonResponse } from "@/shared/test/utils/createJsonResponse";
import { render } from "@/shared/test/utils/render";
import type { AlbumSummaryDTO } from "@/shared/types";
import { AlbumGrid } from "./AlbumGrid";

const pushMock = vi.fn();

vi.mock("next/navigation", () => {
  return {
    useRouter() {
      return {
        push: pushMock,
      };
    },
  };
});

type FetchMock = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const albums: AlbumSummaryDTO[] = [
  {
    artistName: "Radiohead",
    id: "album-1",
    imageUrl: null,
    name: "Kid A",
    releaseDate: "2000-10-02",
    images: [],
    label: "My label",
    totalTracks: 12,
  },
];

describe("AlbumGrid", () => {
  const fetchMock = vi.fn<FetchMock>();

  beforeEach(() => {
    pushMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("navigates to the resolved album route when slug lookup succeeds", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse({ slug: "kid-a" }));

    render(<AlbumGrid albums={albums} />);

    await user.click(screen.getByRole("button", { name: /kid a/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album/kid-a");
    });
  });

  it("shows an opening state while slug lookup is in flight", async () => {
    const user = userEvent.setup();
    const deferredResponse = createDeferred<Response>();

    fetchMock.mockReturnValue(deferredResponse.promise);

    render(<AlbumGrid albums={albums} />);

    await user.click(screen.getByRole("button", { name: /kid a/i }));

    expect(screen.getByText("Opening...")).toBeInTheDocument();

    act(() => {
      deferredResponse.resolve(createJsonResponse({ slug: "kid-a" }));
    });
  });

  it("shows a visible error when slug lookup fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse({}, { status: 500 }));

    render(<AlbumGrid albums={albums} />);

    await user.click(screen.getByRole("button", { name: /kid a/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "We couldn't open that album yet. Please try again in a moment.",
        ),
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
