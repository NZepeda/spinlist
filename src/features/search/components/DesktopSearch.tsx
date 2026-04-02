"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
} from "@/shared/ui/command";
import { cn } from "@/shared/utils/cn";
import { usePointerDownOutside } from "@/shared/hooks/usePointerDownOutside";
import type { DesktopSearchProps } from "@/features/search/types";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { SearchResultsList } from "./SearchResultsList";

/**
 * Renders the desktop search input and keeps desktop-only interaction logic local to the desktop UI.
 *
 * @param props - Shared search data plus the desktop presentation variant.
 * @returns The inline desktop search input and dropdown.
 */
export function DesktopSearch(props: DesktopSearchProps) {
  const {
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isHero = variant === "hero";

  usePointerDownOutside(containerRef, {
    enabled: isOpen,
    onPointerDownOutside: () => {
      setIsOpen(false);
    },
  });

  /**
   * Closes the dropdown whenever the shared query is cleared outside the desktop input flow.
   */
  useEffect(() => {
    if (searchValue.trim().length > 0) {
      return;
    }

    setIsOpen(false);
  }, [searchValue]);

  /**
   * Updates the desktop query while keeping the dropdown visibility in sync with the typed value.
   *
   * @param value - The current desktop input value.
   */
  function handleValueChange(value: string): void {
    clearSelectionError();
    setSearchValue(value);

    if (value.trim().length > 0) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
  }

  /**
   * Reopens the desktop dropdown when focus returns with an active query.
   */
  function handleFocus(): void {
    if (searchValue.trim().length > 0) {
      setIsOpen(true);
    }
  }

  /**
   * Closes the desktop dropdown when focus moves outside the desktop search container.
   *
   * @param event - The focus transition captured by the desktop search root.
   */
  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    const nextFocusedElement = event.relatedTarget;

    if (nextFocusedElement === null) {
      setIsOpen(false);
      return;
    }

    if (!(nextFocusedElement instanceof Node)) {
      setIsOpen(false);
      return;
    }

    if (containerRef.current?.contains(nextFocusedElement)) {
      return;
    }

    setIsOpen(false);
  }

  const shouldShowResults = isOpen && displayState.kind !== "idle";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative hidden w-full md:block",
        isHero ? "max-w-3xl" : "max-w-md",
      )}
    >
      <Command
        shouldFilter={false}
        className={cn(
          "relative overflow-visible border shadow-[0_20px_40px_var(--brand-shadow-soft)]",
          isHero
            ? "rounded-[1.75rem] border-border/70 bg-surface/95 p-2 backdrop-blur"
            : "rounded-xl bg-surface-elevated/95",
        )}
        onBlurCapture={handleBlur}
        onFocusCapture={handleFocus}
      >
        {isHero ? (
          <div className="flex w-full items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background px-4 py-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CommandInput
              placeholder={placeholder}
              value={searchValue}
              onValueChange={handleValueChange}
              className="flex w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        ) : (
          <AnimatedSearchBar
            className="border-b border-border/70 px-3 py-2 [&_[data-slot=animated-search-icon]]:h-4 [&_[data-slot=animated-search-icon]]:w-4 [&_[data-slot=animated-search-input]]:py-2 [&_[data-slot=animated-search-input]]:text-sm [&_[data-slot=animated-search-prompt]]:py-2 [&_[data-slot=animated-search-prompt]]:text-sm"
            placeholder={placeholder}
            value={searchValue}
            onValueChange={handleValueChange}
          />
        )}
        {shouldShowResults ? (
          <CommandList
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-2 overflow-y-auto border bg-surface-elevated/98 shadow-[0_24px_60px_var(--brand-shadow)] backdrop-blur",
              isHero
                ? "max-h-[420px] rounded-[1.35rem] border-border/70"
                : "max-h-[400px] rounded-xl border-border/80",
            )}
          >
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
        ) : null}
        {selectionError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {selectionError}
          </p>
        ) : null}
      </Command>
    </div>
  );
}
