"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  SearchAlbumDTO,
  SearchArtistDTO,
  SearchResponseDTO,
} from "@/lib/types";

const SEARCH_QUERY_DEBOUNCE_MS = 300;
const SEARCH_QUERY_STALE_TIME_MS = 30 * 1000; // 30 seconds
const SEARCH_QUERY_GC_TIME_MS = 5 * 60 * 1000; // 5 minutes
const SEARCH_ERROR_MESSAGE = "Something went wrong. Please try again.";
const SELECTION_ERROR_MESSAGE =
  "We couldn't open that result. Please try again.";

type SearchResultItem = SearchArtistDTO | SearchAlbumDTO;

/**
 * Represents the UI states the search dropdown can render.
 */
export type SearchViewState =
  | {
      kind: "waiting";
    }
  | {
      kind: "loading";
    }
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "empty";
    }
  | {
      kind: "results";
      results: SearchResponseDTO;
    };

interface SlugResponse {
  slug: string;
}

interface SearchViewStateArgs {
  debouncedQuery: string;
  error: Error | null;
  isFetching: boolean;
  results?: SearchResponseDTO;
  searchValue: string;
}

export interface UseSearchBarStateResult {
  handleSelect: (item: SearchResultItem) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  searchValue: string;
  selectionError: string | null;
  setSearchValue: (value: string) => void;
  viewState: SearchViewState;
}

/**
 * Requests search results from the application API.
 *
 * @param query - The search string typed by the user.
 * @returns The normalized search response payload.
 * @throws Error when the request fails.
 */
async function searchSpotify(query: string): Promise<SearchResponseDTO> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  return (await response.json()) as SearchResponseDTO;
}

/**
 * Resolves the slug-backed pathname for a selected search result.
 *
 * @param item - The selected artist or album.
 * @returns The application route for the selected result.
 * @throws Error when the slug request fails or returns invalid data.
 */
export async function resolveSearchResultPath(
  item: SearchResultItem,
): Promise<string> {
  const response = await fetch(
    `/api/slug?spotifyId=${item.id}&type=${item.type}`,
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve slug");
  }

  const data = (await response.json()) as SlugResponse;

  if (typeof data.slug !== "string" || data.slug.length === 0) {
    throw new Error("Invalid slug response");
  }

  return `/${item.type}/${data.slug}`;
}

/**
 * Returns true when a settled search response contains at least one item.
 *
 * @param results - The search response payload.
 * @returns Whether albums or artists were returned.
 */
function hasSearchResults(results: SearchResponseDTO): boolean {
  return results.albums.length > 0 || results.artists.length > 0;
}

/**
 * Maps the raw input and query state into the single dropdown state the UI renders.
 *
 * Search state flow:
 * typing      -> waiting
 * fetching    -> loading
 * no matches  -> empty
 * matches     -> results
 *
 * @param args - The current search input and query state.
 * @returns The derived view state for the dropdown.
 */
function getSearchViewState(args: SearchViewStateArgs): SearchViewState {
  const { searchValue, debouncedQuery, isFetching, results, error } = args;

  if (searchValue !== debouncedQuery) {
    return { kind: "waiting" };
  }

  if (isFetching || !results) {
    if (error) {
      return {
        kind: "error",
        message: SEARCH_ERROR_MESSAGE,
      };
    }

    return { kind: "loading" };
  }

  if (error) {
    return {
      kind: "error",
      message: SEARCH_ERROR_MESSAGE,
    };
  }

  if (!hasSearchResults(results)) {
    return { kind: "empty" };
  }

  return {
    kind: "results",
    results,
  };
}

/**
 * Owns the search bar business logic across the application.
 *
 * @returns The UI state and event handlers required by the SearchBar component.
 */
export function useSearchBarState(): UseSearchBarStateResult {
  const router = useRouter();
  const [searchValue, setSearchValueState] = useState("");
  const [open, setOpen] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const normalizedSearchValue = searchValue.trim();
  const debouncedQuery = useDebounce(
    normalizedSearchValue,
    SEARCH_QUERY_DEBOUNCE_MS,
  );

  const { data, error, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    retry: false,
    staleTime: SEARCH_QUERY_STALE_TIME_MS,
    gcTime: SEARCH_QUERY_GC_TIME_MS,
  });

  const viewState = getSearchViewState({
    debouncedQuery,
    error,
    isFetching,
    results: data,
    searchValue: normalizedSearchValue,
  });

  /**
   * Updates the raw input value and clears stale selection errors.
   *
   * @param value - The latest input value from the command field.
   */
  function setSearchValue(value: string): void {
    const trimmedValue = value.trim();

    setSelectionError(null);
    setSearchValueState(value);

    if (trimmedValue.length > 0) {
      setOpen(true);
      return;
    }

    setOpen(false);
  }

  /**
   * Resolves the selected result to a slug and navigates to the item (album/artist) page.
   *
   * @param item - The chosen artist or album result.
   */
  async function handleSelect(item: SearchResultItem): Promise<void> {
    setSelectionError(null);

    try {
      const path = await resolveSearchResultPath(item);

      setSearchValueState("");
      setOpen(false);
      router.push(path);
    } catch {
      setSelectionError(SELECTION_ERROR_MESSAGE);
    }
  }

  return {
    handleSelect,
    open,
    setOpen,
    searchValue,
    selectionError,
    setSearchValue,
    viewState,
  };
}
