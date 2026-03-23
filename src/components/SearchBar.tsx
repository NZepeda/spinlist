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

type SearchBarVariant = "compact" | "hero" | "sheet";

interface SearchResultProps {
  onSelect: (item: SearchArtistDTO | SearchAlbumDTO) => void;
  viewState: SearchViewState;
}

interface SearchStatusMessageProps {
  message: string;
  showLoadingIcon?: boolean;
}

interface SearchBarProps {
  autoFocus?: boolean;
  onSelectionComplete?: () => void;
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
 * Displays the empty prompt used before mobile sheet search begins.
 */
function SearchPromptMessage() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/70 p-6 text-center text-sm text-muted-foreground">
      Search for an album or artist to open the results list.
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
                    className="h-12 w-12 rounded-xl object-cover shadow-[0_14px_30px_var(--brand-shadow-soft)]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/70">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    className="h-12 w-12 rounded-full object-cover shadow-[0_14px_30px_var(--brand-shadow-soft)]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/70">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
    autoFocus = false,
    onSelectionComplete,
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
  const isSheet = variant === "sheet";
  const shouldShowResults = isSheet ? searchValue.trim().length > 0 : open;

  return (
    <div
      className={cn(
        "relative w-full",
        isHero && "max-w-3xl",
        !isHero && !isSheet && "max-w-md",
        isSheet && "flex h-full flex-col",
      )}
    >
      <Command
        shouldFilter={false}
        className={cn(
          "relative overflow-visible border shadow-[0_20px_40px_var(--brand-shadow-soft)]",
          isHero &&
            "rounded-[1.75rem] border-border/70 bg-surface/95 p-2 backdrop-blur",
          !isHero && !isSheet && "rounded-xl bg-surface-elevated/95",
          isSheet &&
            "flex h-full flex-col rounded-[1.75rem] border-border/70 bg-surface/95 p-3 shadow-none backdrop-blur",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-3",
            isHero &&
              "rounded-[1.2rem] border border-border/70 bg-background px-4 py-2",
            !isHero &&
              !isSheet &&
              "border-b border-border/70 px-3 py-2",
            isSheet &&
              "rounded-[1.35rem] border border-border/70 bg-background px-4 py-3",
          )}
        >
          <Search
            className={cn(
              "text-muted-foreground",
              isHero ? "h-5 w-5" : "h-4 w-4",
              isSheet && "h-5 w-5",
            )}
          />
          <CommandInput
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onFocus={() => {
              if (
                searchValue.trim().length > 0 ||
                viewState.kind === "results"
              ) {
                setOpen(true);
              }
            }}
            onBlur={
              isSheet
                ? undefined
                : () =>
                    setTimeout(() => {
                      setOpen(false);
                    }, 200)
            }
            className={cn(
              "flex w-full rounded-md bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              isHero ? "py-3 text-base" : "py-2 text-sm",
              isSheet && "py-3 text-base",
            )}
          />
        </div>
        {isSheet && searchValue.trim().length === 0 ? (
          <div className="mt-4 flex-1">
            <SearchPromptMessage />
          </div>
        ) : null}
        {shouldShowResults ? (
          <CommandList
            className={cn(
              "overflow-y-auto border bg-surface-elevated/98 backdrop-blur",
              !isSheet &&
                "absolute top-full left-0 right-0 z-50 mt-2 shadow-[0_24px_60px_var(--brand-shadow)]",
              isHero && "max-h-[420px] rounded-[1.35rem] border-border/70",
              !isHero &&
                !isSheet &&
                "max-h-[400px] rounded-xl border-border/80",
              isSheet &&
                "mt-4 flex-1 rounded-[1.5rem] border-border/70 shadow-none",
            )}
          >
            <SearchResults
              onSelect={(item) =>
                void handleSelect(item).then((didNavigate) => {
                  if (didNavigate && onSelectionComplete) {
                    onSelectionComplete();
                  }
                })
              }
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
