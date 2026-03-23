import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/components/SearchBar";
import { createDeferred } from "@/test/utils/createDeferred";
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
 * Builds a standard search payload for component tests.
 *
 * @returns Search results containing one album and one artist.
 */
function createSearchResults(): SearchResponseDTO {
  return {
    albums: [
      {
        id: "album-1",
        name: "Kid A",
        artistName: "Radiohead",
        imageUrl: null,
        releaseDate: "2000-10-02",
        type: "album",
      },
    ],
    artists: [
      {
        id: "artist-1",
        name: "Radiohead",
        imageUrl: null,
        type: "artist",
      },
    ],
  };
}

/**
 * Waits for the debounced search request to become eligible to run.
 */
async function waitForDebounce(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });
  });
}

/**
 * Types into the search input using the configured user-event instance.
 *
 * @param user - The configured user-event instance.
 * @param value - The query to type.
 * @param placeholder - The input placeholder to target.
 */
async function typeSearchValue(
  user: ReturnType<typeof userEvent.setup>,
  value: string,
  placeholder = "Search for albums or artists...",
): Promise<void> {
  await user.type(screen.getByPlaceholderText(placeholder), value);
}

describe("SearchBar", () => {
  const fetchMock = vi.fn<FetchMock>();

  beforeEach(() => {
    pushMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("does not render dropdown content before the user types a query", () => {
    render(<SearchBar />);

    expect(
      screen.queryByText(
        "Loading results...",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders the mobile sheet prompt before the user starts searching", () => {
    render(<SearchBar variant="sheet" />);

    expect(
      screen.getByText("Search for an album or artist to open the results list."),
    ).toBeInTheDocument();
  });

  it("shows a waiting state before the debounce completes", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    await typeSearchValue(user, "radiohead");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows a loading state after the debounce when the request is in flight", async () => {
    const user = userEvent.setup();
    const deferredSearch = createDeferred<Response>();

    fetchMock.mockImplementation((input) => {
      if (getRequestUrl(input).startsWith("/api/search")) {
        return deferredSearch.promise;
      }

      throw new Error(`Unexpected fetch request: ${getRequestUrl(input)}`);
    });

    render(<SearchBar />);

    await typeSearchValue(user, "radiohead");
    await waitForDebounce();

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    deferredSearch.resolve(createJsonResponse({ artists: [], albums: [] }));

    await waitFor(() => {
      expect(
        screen.getByText("No matches yet. Try a different album or artist."),
      ).toBeInTheDocument();
    });
  });

  it("renders album and artist results after a successful search", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    render(<SearchBar />);

    await typeSearchValue(user, "radiohead");
    await waitForDebounce();

    await waitFor(() => {
      expect(screen.getByText("Albums")).toBeInTheDocument();
    });

    expect(screen.getByText("Kid A")).toBeInTheDocument();
    expect(screen.getByText("Open the full discography.")).toBeInTheDocument();
  });

  it("shows an empty state only after a successful empty response", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse({ artists: [], albums: [] }),
    );

    render(<SearchBar />);

    await typeSearchValue(user, "no matches");

    expect(
      screen.queryByText("No matches yet. Try a different album or artist."),
    ).not.toBeInTheDocument();

    await waitForDebounce();

    await waitFor(() => {
      expect(
        screen.getByText("No matches yet. Try a different album or artist."),
      ).toBeInTheDocument();
    });
  });

  it("shows an error state when the search request fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse({}, { status: 500 }));

    render(<SearchBar />);

    await typeSearchValue(user, "broken");
    await waitForDebounce();

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("hides the dropdown when the user clears the query", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    render(<SearchBar />);

    await typeSearchValue(user, "radiohead");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Search for albums or artists..."));

    await waitFor(() => {
      expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
    });
  });

  it("closes on blur and reopens on focus when the query still exists", async () => {
    const user = userEvent.setup();

    fetchMock.mockImplementation((input) => {
      if (getRequestUrl(input).startsWith("/api/search")) {
        return Promise.resolve(createJsonResponse(createSearchResults()));
      }

      throw new Error(`Unexpected fetch request: ${getRequestUrl(input)}`);
    });

    render(<SearchBar />);

    await typeSearchValue(user, "radiohead");

    const input = screen.getByPlaceholderText("Search for albums or artists...");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
    });

    fireEvent.focus(input);

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
  });

  it("anchors the dropdown below the search input", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    const { container } = render(<SearchBar variant="hero" />);

    await typeSearchValue(
      user,
      "radiohead",
      "Search for albums or artists...",
    );
    await waitForDebounce();

    await waitFor(() => {
      expect(screen.getByText("Albums")).toBeInTheDocument();
    });

    const commandRoot = container.querySelector("[data-slot='command']");
    const commandList = container.querySelector("[data-slot='command-list']");

    expect(commandRoot).not.toBeNull();
    expect(commandList).not.toBeNull();
    expect(commandRoot).toHaveClass("relative");
    expect(commandList).toHaveClass("top-full");
  });

  it("navigates to the selected result when slug lookup succeeds", async () => {
    const user = userEvent.setup();

    fetchMock.mockImplementation((input) => {
      const url = getRequestUrl(input);

      if (url.startsWith("/api/search")) {
        return Promise.resolve(createJsonResponse(createSearchResults()));
      }

      if (url.startsWith("/api/slug")) {
        return Promise.resolve(createJsonResponse({ slug: "kid-a" }));
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    render(<SearchBar />);

    await typeSearchValue(user, "kid a");
    await waitForDebounce();

    await user.click(await screen.findByText("Kid A"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album/kid-a");
    });
  });

  it("shows a selection error and does not navigate when slug lookup fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockImplementation((input) => {
      const url = getRequestUrl(input);

      if (url.startsWith("/api/search")) {
        return Promise.resolve(createJsonResponse(createSearchResults()));
      }

      if (url.startsWith("/api/slug")) {
        return Promise.resolve(createJsonResponse({}, { status: 500 }));
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    render(<SearchBar />);

    await typeSearchValue(user, "kid a");
    await waitForDebounce();

    await user.click(await screen.findByText("Kid A"));

    await waitFor(() => {
      expect(
        screen.getByText("We couldn't open that result. Please try again."),
      ).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("runs the completion callback after a successful sheet selection", async () => {
    const user = userEvent.setup();
    const onSelectionComplete = vi.fn();

    fetchMock.mockImplementation((input) => {
      const url = getRequestUrl(input);

      if (url.startsWith("/api/search")) {
        return Promise.resolve(createJsonResponse(createSearchResults()));
      }

      if (url.startsWith("/api/slug")) {
        return Promise.resolve(createJsonResponse({ slug: "kid-a" }));
      }

      throw new Error(`Unexpected fetch request: ${url}`);
    });

    render(
      <SearchBar
        onSelectionComplete={onSelectionComplete}
        placeholder="Search for an album or artist"
        variant="sheet"
      />,
    );

    await typeSearchValue(user, "kid a", "Search for an album or artist");
    await waitForDebounce();
    await user.click(await screen.findByText("Kid A"));

    await waitFor(() => {
      expect(onSelectionComplete).toHaveBeenCalledTimes(1);
    });
  });
});
