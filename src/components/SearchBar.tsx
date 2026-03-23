"use client";

import { DesktopSearch } from "@/components/search/DesktopSearch";
import { MobileSearchDialog } from "@/components/search/MobileSearchDialog";
import { useSearchController } from "@/components/search/useSearchController";
import type { SearchBarProps } from "@/components/search/types";

/**
 * Global search input that stays inline on desktop and opens a full-screen dialog on mobile.
 *
 * @param props - Presentation configuration for the current search bar.
 * @returns The responsive search experience for albums and artists.
 */
export function SearchBar(props: SearchBarProps) {
  const {
    placeholder = "Search for albums or artists...",
    variant = "compact",
  } = props;
  const controller = useSearchController();

  return (
    <div className="w-full">
      <MobileSearchDialog
        clearSearch={controller.clearSearch}
        clearSelectionError={controller.clearSelectionError}
        displayState={controller.displayState}
        handleResultSelect={controller.handleResultSelect}
        placeholder={placeholder}
        searchValue={controller.searchValue}
        selectionError={controller.selectionError}
        setSearchValue={controller.setSearchValue}
        variant={variant}
      />
      <DesktopSearch
        clearSelectionError={controller.clearSelectionError}
        displayState={controller.displayState}
        handleResultSelect={controller.handleResultSelect}
        placeholder={placeholder}
        searchValue={controller.searchValue}
        selectionError={controller.selectionError}
        setSearchValue={controller.setSearchValue}
        variant={variant}
      />
    </div>
  );
}
