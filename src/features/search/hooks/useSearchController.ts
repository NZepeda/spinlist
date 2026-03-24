"use client";

import { useRouter } from "next/navigation";
import {
  type SearchResultItem,
  useSearchQueryState,
} from "@/features/search/hooks/useSearchQueryState";
import { useSearchSelection } from "@/features/search/hooks/useSearchSelection";
import type { SearchResponseDTO } from "@/shared/types";
import type { SearchDisplayState } from "@/features/search/types";

const SEARCH_ERROR_MESSAGE = "Something went wrong. Please try again.";

export interface UseSearchControllerResult {
  clearSearch: () => void;
  clearSelectionError: () => void;
  displayState: SearchDisplayState;
  handleResultSelect: (
    item: SearchResultItem,
    options?: {
      onSuccess?: () => void;
    },
  ) => Promise<void>;
  searchValue: string;
  selectionError: string | null;
  setSearchValue: (value: string) => void;
}

/**
 * Returns true when a settled search response contains at least one result.
 *
 * @param results - The search response payload returned by the API.
 * @returns Whether albums or artists were returned.
 */
function hasSearchResults(
  results: SearchResponseDTO,
): boolean {
  return results.albums.length > 0 || results.artists.length > 0;
}

/**
 * Maps raw query facts into the display state rendered by the search components.
 *
 * @param args - The current query facts gathered from the search hooks.
 * @returns The display state used by the shared search renderer.
 */
function getSearchDisplayState(args: {
  error: Error | null;
  hasQuery: boolean;
  isDebouncing: boolean;
  isFetching: boolean;
  results: SearchResponseDTO | undefined;
}): SearchDisplayState {
  const { error, hasQuery, isDebouncing, isFetching, results } = args;

  if (!hasQuery) {
    return { kind: "idle" };
  }

  if (isDebouncing) {
    return { kind: "waiting" };
  }

  if (error) {
    return {
      kind: "error",
      message: SEARCH_ERROR_MESSAGE,
    };
  }

  if (isFetching || !results) {
    return { kind: "loading" };
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
 * Composes the query and selection hooks into the controller shared by desktop and mobile search components.
 *
 * @returns The shared controller for search input, selection, and display state.
 */
export function useSearchController(): UseSearchControllerResult {
  const router = useRouter();
  const {
    clearSearch,
    error,
    hasQuery,
    isDebouncing,
    isFetching,
    results,
    searchValue,
    setSearchValue,
  } = useSearchQueryState();
  const { clearSelectionError, selectResult, selectionError } =
    useSearchSelection();
  const displayState = getSearchDisplayState({
    error,
    hasQuery,
    isDebouncing,
    isFetching,
    results,
  });

  /**
   * Resolves the selected result and applies the surrounding search side effects.
   *
   * @param item - The chosen album or artist result.
   * @param options - Component-specific success behavior.
   */
  async function handleResultSelect(
    item: SearchResultItem,
    options?: {
      onSuccess?: () => void;
    },
  ): Promise<void> {
    const path = await selectResult(item);

    if (!path) {
      return;
    }

    clearSearch();
    options?.onSuccess?.();
    router.push(path);
  }

  return {
    clearSearch,
    clearSelectionError,
    displayState,
    handleResultSelect,
    searchValue,
    selectionError,
    setSearchValue,
  };
}
