import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { createJsonResponse } from "@/test/utils/createJsonResponse";
import { getRequestUrl } from "@/test/utils/getRequestUrl";
import { render } from "@/test/utils/render";
import { ResizeObserverMock } from "@/test/utils/ResizeObserverMock";
import type { SearchResponseDTO } from "@/lib/types";

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

/**
 * Builds one search response used to verify homepage-driven navigation.
 *
 * @returns A search payload containing the homepage-targeted artist result.
 */
function createHomepageSearchResults(): SearchResponseDTO {
  return {
    albums: [],
    artists: [
      {
        id: "artist-beyonce",
        imageUrl: null,
        name: "Beyonce",
        type: "artist",
      },
    ],
  };
}

/**
 * Waits long enough for the debounced search query to execute.
 */
async function waitForSearchDebounce(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });
  });
}

describe("Home page", () => {
  const fetchMock = vi.fn<FetchMock>();

  beforeEach(() => {
    pushMock.mockReset();
    fetchMock.mockReset();
    window.localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renders the branded search hero without seeded homepage content", () => {
    render(<Home />);

    expect(screen.getByText("Find the album.")).toBeInTheDocument();
    expect(screen.getByText("Log the feeling.")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Search for an album, artist, or obsession...",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Why search first")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Albums worth logging first"),
    ).not.toBeInTheDocument();
  });

  it("searches from the hero and navigates to the resolved destination", async () => {
    const user = userEvent.setup();

    fetchMock.mockImplementation((input) => {
      const url = getRequestUrl(input);

      if (url.startsWith("/api/search")) {
        return Promise.resolve(
          createJsonResponse(createHomepageSearchResults()),
        );
      }

      if (url.startsWith("/api/slug")) {
        return Promise.resolve(createJsonResponse({ slug: "beyonce" }));
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    render(<Home />);

    await user.type(
      screen.getByPlaceholderText(
        "Search for an album, artist, or obsession...",
      ),
      "beyonce",
    );
    await waitForSearchDebounce();
    await user.click(await screen.findByText("Beyonce"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/artist/beyonce");
    });
  });
});
