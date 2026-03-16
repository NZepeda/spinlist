"use client";

import { Fragment } from "react";
import { ArrowUpRight, LoaderCircle, Search } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui-core/command";
import {
  type SearchViewState,
  useSearchBarState,
} from "@/hooks/useSearchBarState";
import { cn } from "@/lib/cn";
import type { SearchAlbumDTO, SearchArtistDTO } from "@/lib/types";

type SearchBarVariant = "compact" | "hero";

interface SearchResultProps {
  onSelect: (item: SearchArtistDTO | SearchAlbumDTO) => void;
  viewState: SearchViewState;
}

interface SearchStatusMessageProps {
  message: string;
  showLoadingIcon?: boolean;
}

interface SearchBarProps {
  placeholder?: string;
  variant?: SearchBarVariant;
}

/**
 * Displays a non-interactive status row inside the search dropdown.
 *
 * @param props - The text to show for the current dropdown state.
 * @returns A styled status message row.
 */
function SearchStatusMessage(props: SearchStatusMessageProps) {
  const { message, showLoadingIcon = false } = props;

  return (
    <div className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
      {showLoadingIcon ? (
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin text-muted-foreground"
        />
      ) : null}
      <span>{message}</span>
    </div>
  );
}

/**
 * Renders the dropdown content for the search command, including the pre-type, loading, empty, error, and results states.
 *
 * @param props - The current view state and selection callbacks.
 * @returns The dropdown content for the search command.
 */
function SearchResults(props: SearchResultProps) {
  const { viewState, onSelect } = props;

  if (viewState.kind === "loading" || viewState.kind === "waiting") {
    return <SearchStatusMessage message="Loading results..." showLoadingIcon />;
  }

  if (viewState.kind === "error") {
    return <SearchStatusMessage message={viewState.message} />;
  }

  if (viewState.kind === "empty") {
    return (
      <SearchStatusMessage message="No matches yet. Try a different album or artist." />
    );
  }

  const { artists, albums } = viewState.results;

  return (
    <Fragment>
      {albums.length > 0 ? (
        <CommandGroup heading="Albums">
          {albums.map((album) => {
            return (
              <CommandItem
                key={album.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                onSelect={() => onSelect(album)}
              >
                {album.imageUrl ? (
                  <img
                    src={album.imageUrl}
                    alt={album.name}
                    className="h-12 w-12 rounded-xl object-cover shadow-[0_14px_30px_oklch(0.15_0.005_50/14%)]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/70">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {album.name}
                    </p>
                    <span className="rounded-full border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Album
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {album.artistName} •{" "}
                    {new Date(album.releaseDate).getFullYear()}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CommandItem>
            );
          })}
        </CommandGroup>
      ) : null}
      {artists.length > 0 ? (
        <CommandGroup heading="Artists">
          {artists.map((artist) => {
            return (
              <CommandItem
                key={artist.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                onSelect={() => onSelect(artist)}
              >
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="h-12 w-12 rounded-full object-cover shadow-[0_14px_30px_oklch(0.15_0.005_50/14%)]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/70">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {artist.name}
                    </p>
                    <span className="rounded-full border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Artist
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Open the full discography.
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CommandItem>
            );
          })}
        </CommandGroup>
      ) : null}
    </Fragment>
  );
}

/**
 * Global search input for artists and albums with configurable presentation.
 *
 * @param props - Presentation configuration for the current render.
 * @returns The interactive search bar and dropdown results.
 */
export function SearchBar(props: SearchBarProps) {
  const {
    placeholder = "Search for albums or artists...",
    variant = "compact",
  } = props;
  const {
    handleSelect,
    open,
    selectionError,
    setOpen,
    setSearchValue,
    searchValue,
    viewState,
  } = useSearchBarState();
  const isHero = variant === "hero";

  return (
    <div className={cn("relative w-full", isHero ? "max-w-3xl" : "max-w-md")}>
      <Command
        shouldFilter={false}
        className={cn(
          "overflow-visible border shadow-[0_20px_40px_oklch(0.15_0.005_50/10%)]",
          isHero
            ? "rounded-[1.75rem] border-border/70 bg-surface/90 p-2 backdrop-blur"
            : "rounded-xl bg-background/95",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-3",
            isHero
              ? "rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-2"
              : "border-b px-3 py-2",
          )}
        >
          <Search
            className={cn(
              "text-muted-foreground",
              isHero ? "h-5 w-5" : "h-4 w-4",
            )}
          />
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onFocus={() => setOpen(true)}
            onBlur={() =>
              setTimeout(() => {
                setOpen(false);
              }, 200)
            }
            className={cn(
              "flex w-full rounded-md bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              isHero ? "py-3 text-base" : "py-2 text-sm",
            )}
          />
        </div>
        {open ? (
          <CommandList
            className={cn(
              "absolute left-0 right-0 z-50 mt-2 overflow-y-auto border bg-background/95 shadow-[0_24px_60px_oklch(0.15_0.005_50/14%)] backdrop-blur",
              isHero
                ? "max-h-[420px] rounded-[1.35rem] border-border/70"
                : "max-h-[400px] rounded-xl border-border/80",
            )}
          >
            <SearchResults
              onSelect={(item) => void handleSelect(item)}
              viewState={viewState}
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
