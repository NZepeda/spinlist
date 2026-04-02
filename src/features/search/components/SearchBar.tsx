"use client";

import { DesktopSearch } from "@/features/search/components/DesktopSearch";
import { MobileSearchDialog } from "@/features/search/components/MobileSearchDialog";
import { useSearchController } from "@/features/search/hooks/useSearchController";
import type { SearchBarProps } from "@/features/search/types";

/**
 * Global search input that stays inline on desktop and opens a full-screen dialog on mobile.
 *
 * @param props - Presentation configuration for the current search bar.
 * @returns The responsive search experience for albums and artists.
 */
export function SearchBar(props: SearchBarProps) {
  const { placeholder, variant = "compact" } = props;
  const controller = useSearchController();

  return (
    <div className="w-full">
      <MobileSearchDialog
        clearSearch={controller.clearSearch}
        clearSelectionError={controller.clearSelectionError}
        displayState={controller.displayState}
        handleResultSelect={controller.handleResultSelect}
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
