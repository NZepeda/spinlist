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

/**
 * Represents the UI states the search dropdown can render.
 */
export type SearchViewState =
  | {
      kind: "idle";
    }
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
  searchValue: string;
  debouncedQuery: string;
  isFetching: boolean;
  results?: SearchResponseDTO;
  error: Error | null;
}

interface UseSearchBarStateResult {
  searchValue: string;
  open: boolean;
  viewState: SearchViewState;
  selectionError: string | null;
  setOpen: (open: boolean) => void;
  setSearchValue: (value: string) => void;
  handleSelect: (item: SearchArtistDTO | SearchAlbumDTO) => Promise<void>;
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
 * Retrieves the slug for a selected search result.
 *
 * @param item - The selected artist or album.
 * @returns The resolved slug string.
 * @throws Error when the slug request fails or returns invalid data.
 */
async function fetchSearchResultSlug(
  item: SearchArtistDTO | SearchAlbumDTO,
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

  return data.slug;
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
 * State flow:
 * raw input -> debounce pending -> waiting
 * raw input -> query fetching    -> loading
 * settled query + no items       -> empty
 * settled query + items          -> results
 *
 * @param args - The current search input and query state.
 * @returns The derived view state for the dropdown.
 */
function getSearchViewState(args: SearchViewStateArgs): SearchViewState {
  const { searchValue, debouncedQuery, isFetching, results, error } = args;

  if (searchValue.length === 0) {
    return { kind: "idle" };
  }

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
 * Owns the search bar's business logic: debounced querying, derived view state,
 * and result selection navigation.
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
    searchValue: normalizedSearchValue,
    debouncedQuery,
    isFetching,
    results: data,
    error,
  });

  /**
   * Updates the raw input value and clears stale selection errors.
   *
   * @param value - The latest input value from the command field.
   */
  function setSearchValue(value: string): void {
    setSelectionError(null);
    setSearchValueState(value);
  }

  /**
   * Resolves the selected result to a slug and navigates to its details page.
   *
   * @param item - The chosen artist or album result.
   */
  async function handleSelect(
    item: SearchArtistDTO | SearchAlbumDTO,
  ): Promise<void> {
    setSelectionError(null);

    try {
      const slug = await fetchSearchResultSlug(item);

      setSearchValueState("");
      setOpen(false);
      router.push(`/${item.type}/${slug}`);
    } catch {
      setSelectionError(SELECTION_ERROR_MESSAGE);
    }
  }

  return {
    searchValue,
    open,
    viewState,
    selectionError,
    setOpen,
    setSearchValue,
    handleSelect,
  };
}
