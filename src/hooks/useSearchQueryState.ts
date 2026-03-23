"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  SearchAlbumDTO,
  SearchArtistDTO,
  SearchResponseDTO,
} from "@/lib/types";

const SEARCH_QUERY_DEBOUNCE_MS = 300;
const SEARCH_QUERY_STALE_TIME_MS = 30 * 1000;
const SEARCH_QUERY_GC_TIME_MS = 5 * 60 * 1000;

export type SearchResultItem = SearchArtistDTO | SearchAlbumDTO;

export interface UseSearchQueryStateResult {
  clearSearch: () => void;
  debouncedQuery: string;
  error: Error | null;
  hasQuery: boolean;
  isDebouncing: boolean;
  isFetching: boolean;
  results: SearchResponseDTO | undefined;
  searchValue: string;
  setSearchValue: (value: string) => void;
}

/**
 * Requests search results from the application API.
 *
 * @param query - The normalized query string typed by the listener.
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
 * Owns the debounced query lifecycle and raw search response state.
 *
 * @returns Query state used by inline and sheet search surfaces.
 */
export function useSearchQueryState(): UseSearchQueryStateResult {
  const [searchValue, setSearchValueState] = useState("");
  const normalizedSearchValue = searchValue.trim();
  const debouncedQuery = useDebounce(
    normalizedSearchValue,
    SEARCH_QUERY_DEBOUNCE_MS,
  );
  const hasQuery = normalizedSearchValue.length > 0;
  const isDebouncing = hasQuery && normalizedSearchValue !== debouncedQuery;

  const { data, error, isFetching } = useQuery<SearchResponseDTO, Error>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    retry: false,
    staleTime: SEARCH_QUERY_STALE_TIME_MS,
    gcTime: SEARCH_QUERY_GC_TIME_MS,
  });

  /**
   * Stores the latest raw search input value.
   *
   * @param value - The current command input value.
   */
  function setSearchValue(value: string): void {
    setSearchValueState(value);
  }

  /**
   * Resets the query back to its initial empty state.
   */
  function clearSearch(): void {
    setSearchValueState("");
  }

  return {
    clearSearch,
    debouncedQuery,
    error,
    hasQuery,
    isDebouncing,
    isFetching,
    results: data,
    searchValue,
    setSearchValue,
  };
}
