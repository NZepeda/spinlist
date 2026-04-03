"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Command, CommandList } from "@/shared/ui/command";
import type { MobileSearchDialogProps } from "@/features/search/types";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { SearchDialogButton } from "./SearchDialogButton";
import { SearchResultsList } from "./SearchResultsList";

/**
 * Displays the empty prompt used before the mobile search dialog begins.
 *
 * @returns The prompt shown before a mobile listener enters a query.
 */
function SearchPromptMessage() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/70 p-6 text-center text-sm text-muted-foreground">
      Search for an album or artist to open the results list.
    </div>
  );
}

/**
 * Renders the mobile search dialog and keeps mobile-only interaction logic local to the mobile UI.
 *
 * @param props - Shared search data plus the mobile dialog lifecycle callbacks.
 * @returns The mobile trigger and full-screen search dialog.
 */
export function MobileSearchDialog(props: MobileSearchDialogProps) {
  const {
    clearSearch,
    clearSelectionError,
    displayState,
    handleResultSelect,
    placeholder,
    searchValue,
    selectionError,
    setSearchValue,
    variant,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Restores focus to the mobile input when the dialog opens.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  /**
   * Updates the query while clearing stale selection errors between attempts.
   *
   * @param value - The current mobile input value.
   */
  function handleValueChange(value: string): void {
    clearSelectionError();
    setSearchValue(value);
  }

  /**
   * Opens the mobile search dialog.
   */
  function handleOpen(): void {
    clearSelectionError();
    setIsOpen(true);
  }

  /**
   * Handles mobile dialog lifecycle so dismissed sessions start from a fresh search state.
   */
  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      return;
    }

    clearSearch();
    clearSelectionError();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <SearchDialogButton
        onOpen={handleOpen}
        placeholder={placeholder}
        variant={variant}
      />
      <DialogContent
        presentation="full-screen"
        className="grid-rows-[auto_minmax(0,1fr)] md:hidden"
        showCloseButton
      >
        <DialogHeader className="text-left h-6">
          <DialogTitle className="text-2xl">Search</DialogTitle>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-surface/95 p-3 shadow-none backdrop-blur"
        >
          <AnimatedSearchBar
            autoFocus
            className="rounded-[1.35rem] border border-border/70 bg-background px-4 py-3 [&_[data-slot=animated-search-icon]]:h-5 [&_[data-slot=animated-search-icon]]:w-5 [&_[data-slot=animated-search-icon]]:text-muted-background [&_[data-slot=animated-search-input]]:py-3 [&_[data-slot=animated-search-input]]:text-base [&_[data-slot=animated-search-prompt]]:py-3 [&_[data-slot=animated-search-prompt]]:text-base"
            inputRef={inputRef}
            placeholder={placeholder}
            value={searchValue}
            onValueChange={handleValueChange}
          />
          {displayState.kind === "idle" ? (
            <div className="mt-4 flex-1">
              <SearchPromptMessage />
            </div>
          ) : (
            <CommandList className="mt-4 flex-1 overflow-y-auto rounded-[1.5rem] border border-border/70 bg-surface-elevated/98 shadow-none backdrop-blur">
              <SearchResultsList
                displayState={displayState}
                onSelect={(item) =>
                  void handleResultSelect(item, {
                    onSuccess: () => {
                      setIsOpen(false);
                    },
                  })
                }
              />
            </CommandList>
          )}
          {selectionError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {selectionError}
            </p>
          ) : null}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
