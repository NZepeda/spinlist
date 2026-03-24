"use client";

import { useState } from "react";
import type { SearchResultItem } from "@/features/search/hooks/useSearchQueryState";

const SELECTION_ERROR_MESSAGE =
  "We couldn't open that result. Please try again.";

interface SlugResponse {
  slug: string;
}

export interface UseSearchSelectionResult {
  clearSelectionError: () => void;
  selectResult: (item: SearchResultItem) => Promise<string | null>;
  selectionError: string | null;
}

/**
 * Resolves the slug-backed pathname for a selected search result.
 *
 * @param item - The selected artist or album result.
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
 * Owns slug resolution and selection error state for search surfaces.
 *
 * @returns The selection helper used to turn a chosen item into an application path.
 */
export function useSearchSelection(): UseSearchSelectionResult {
  const [selectionError, setSelectionError] = useState<string | null>(null);

  /**
   * Clears the current selection error so the next interaction starts fresh.
   */
  function clearSelectionError(): void {
    setSelectionError(null);
  }

  /**
   * Resolves the selected result into a destination path.
   *
   * @param item - The search result chosen by the listener.
   * @returns The destination path on success, or `null` when resolution fails.
   */
  async function selectResult(item: SearchResultItem): Promise<string | null> {
    clearSelectionError();

    try {
      return await resolveSearchResultPath(item);
    } catch {
      setSelectionError(SELECTION_ERROR_MESSAGE);
      return null;
    }
  }

  return {
    clearSelectionError,
    selectResult,
    selectionError,
  };
}
