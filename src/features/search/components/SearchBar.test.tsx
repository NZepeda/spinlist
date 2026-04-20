import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Required to prevent errors from the TypeAnimation component used in the SearchBar's animated prompt.
// Under the hood, it uses ResizeObserver, which isn't supported in the JSDOM environment used for testing.
vi.mock("react-type-animation", () => ({
  TypeAnimation: () => null,
}));
import { SearchBar } from "@/features/search/components/SearchBar";
import { createJsonResponse } from "@/shared/test/utils/createJsonResponse";
import { getRequestUrl } from "@/shared/test/utils/getRequestUrl";
import { render } from "@/shared/test/utils/render";
import { ResizeObserverMock } from "@/shared/test/utils/ResizeObserverMock";
import type { SearchResponseDTO } from "@/shared/types";

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
 * Types into the desktop search input.
 *
 * @param user - The configured user-event instance.
 * @param value - The query to type.
 * @param placeholder - The optional desktop input placeholder to target.
 */
async function typeDesktopSearchValue(
  user: ReturnType<typeof userEvent.setup>,
  value: string,
  placeholder?: string,
): Promise<void> {
  const desktopInput = placeholder
    ? screen.getByPlaceholderText(placeholder)
    : screen.getByRole("combobox");

  await user.type(desktopInput, value);
}

/**
 * Opens the mobile dialog and returns its root element.
 *
 * @param user - The configured user-event instance.
 * @returns The mobile dialog element.
 */
async function openMobileSearch(
  user: ReturnType<typeof userEvent.setup>,
): Promise<HTMLElement> {
  await user.click(screen.getByRole("button", { name: "Open search" }));

  return await screen.findByRole("dialog");
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

  it("does not render desktop dropdown content before the user types a query", () => {
    render(<SearchBar />);

    expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
  });

  it("shows a waiting state on desktop before the debounce completes", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    await typeDesktopSearchValue(user, "radiohead");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders desktop results and navigates when the user selects an item", async () => {
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

    await typeDesktopSearchValue(user, "kid a");
    await waitForDebounce();
    await user.click(await screen.findByText("Kid A"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album/kid-a");
    });
  });

  it("hides the desktop dropdown when the user clears the query", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    render(<SearchBar />);

    await typeDesktopSearchValue(user, "radiohead");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    await user.clear(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
    });
  });

  it("closes the desktop dropdown on blur and reopens it on focus", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    render(<SearchBar />);

    await typeDesktopSearchValue(user, "radiohead");

    const input = screen.getByRole("combobox");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
    });

    fireEvent.focus(input);

    expect(screen.getByText("Loading results...")).toBeInTheDocument();
  });

  it("closes the desktop dropdown when a pointer interaction happens outside the search bar", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    render(<SearchBar />);

    await typeDesktopSearchValue(user, "radiohead");

    expect(screen.getByText("Loading results...")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Loading results...")).not.toBeInTheDocument();
    });
  });

  it("anchors the desktop hero dropdown below the search input", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse(createSearchResults()));

    const { container } = render(
      <SearchBar placeholder="Search for an album or artist" variant="hero" />,
    );

    await typeDesktopSearchValue(
      user,
      "radiohead",
      "Search for an album or artist",
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

  it("keeps the desktop input interactive while the animated prompt is visible", async () => {
    const user = userEvent.setup();

    const { container } = render(<SearchBar />);

    const desktopInput = screen.getByRole("combobox");
    const animatedPrompt = container.querySelector(
      "[data-slot='animated-search-prompt']",
    );

    expect(animatedPrompt).not.toBeNull();
    expect(animatedPrompt).toHaveClass("opacity-100");

    await user.click(desktopInput);

    expect(desktopInput).toHaveFocus();

    await user.type(desktopInput, "kid a");

    expect(desktopInput).toHaveValue("kid a");
    expect(animatedPrompt).toHaveClass("invisible");
    expect(animatedPrompt).toHaveClass("opacity-0");

    await user.clear(desktopInput);

    expect(animatedPrompt).toHaveClass("opacity-100");
  });

  it("opens the compact mobile search sheet and shows the idle prompt", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const dialog = await openMobileSearch(user);

    expect(within(dialog).getByText("Search")).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Search for an album or artist to open the results list.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the mobile input interactive while the animated prompt is visible", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const dialog = await openMobileSearch(user);
    const mobileInput = within(dialog).getByRole("combobox");
    const animatedPrompt = dialog.querySelector(
      "[data-slot='animated-search-prompt']",
    );

    expect(animatedPrompt).not.toBeNull();

    expect(animatedPrompt).toHaveClass("opacity-100");

    await user.click(mobileInput);

    expect(mobileInput).toHaveFocus();

    await user.type(mobileInput, "kid a");

    expect(mobileInput).toHaveValue("kid a");
    expect(animatedPrompt).toHaveClass("invisible");
    expect(animatedPrompt).toHaveClass("opacity-0");

    await user.clear(mobileInput);

    expect(animatedPrompt).toHaveClass("opacity-100");
  });

  it("opens the hero mobile search sheet from the full-width trigger", async () => {
    const user = userEvent.setup();

    render(
      <SearchBar
        placeholder="Search for an album, artist, or obsession..."
        variant="hero"
      />,
    );

    const dialog = await openMobileSearch(user);

    expect(within(dialog).getByText("Search")).toBeInTheDocument();
  });

  it("renders mobile empty results after a successful empty search response", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(
      createJsonResponse({ artists: [], albums: [] }),
    );

    render(<SearchBar />);

    const dialog = await openMobileSearch(user);
    const mobileInput = within(dialog).getByRole("combobox");

    await user.type(mobileInput, "no matches");

    expect(
      within(dialog).queryByText(
        "No matches yet. Try a different album or artist.",
      ),
    ).not.toBeInTheDocument();

    await waitForDebounce();

    await waitFor(() => {
      expect(
        within(dialog).getByText(
          "No matches yet. Try a different album or artist.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows a mobile error state when the search request fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValue(createJsonResponse({}, { status: 500 }));

    render(<SearchBar />);

    const dialog = await openMobileSearch(user);
    const mobileInput = within(dialog).getByRole("combobox");

    await user.type(mobileInput, "broken");
    await waitForDebounce();

    await waitFor(() => {
      expect(
        within(dialog).getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("navigates and closes the mobile dialog after a successful selection", async () => {
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

    const dialog = await openMobileSearch(user);
    const mobileInput = within(dialog).getByRole("combobox");

    await user.type(mobileInput, "kid a");
    await waitForDebounce();
    await user.click(await within(dialog).findByText("Kid A"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/album/kid-a");
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows a selection error in the mobile dialog and keeps it open when slug lookup fails", async () => {
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

    const dialog = await openMobileSearch(user);
    const mobileInput = within(dialog).getByRole("combobox");

    await user.type(mobileInput, "kid a");
    await waitForDebounce();
    await user.click(await within(dialog).findByText("Kid A"));

    await waitFor(() => {
      expect(
        within(dialog).getByText(
          "We couldn't open that result. Please try again.",
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
