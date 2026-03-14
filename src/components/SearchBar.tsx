"use client";

import { Fragment } from "react";
import { LoaderCircle, Search } from "lucide-react";
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
import type { SearchAlbumDTO, SearchArtistDTO } from "@/lib/types";

interface SearchResultProps {
  viewState: SearchViewState;
  onSelect: (item: SearchArtistDTO | SearchAlbumDTO) => void;
}

interface SearchStatusMessageProps {
  message: string;
  showLoadingIcon?: boolean;
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
    <div className="flex items-center justify-center gap-2 py-6 text-center text-sm">
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
 * Renders the dropdown content for the search command, including all empty,
 * loading, error, and results states.
 *
 * @param props - The current view state and result selection callback.
 * @returns The dropdown content for the search command.
 */
function SearchResults(props: SearchResultProps) {
  const { viewState, onSelect } = props;

  if (viewState.kind === "waiting") {
    return <SearchStatusMessage message="Loading" showLoadingIcon />;
  }

  if (viewState.kind === "loading") {
    return <SearchStatusMessage message="Loading" showLoadingIcon />;
  }

  if (viewState.kind === "error") {
    return <SearchStatusMessage message={viewState.message} />;
  }

  if (viewState.kind === "empty") {
    return <SearchStatusMessage message="No results found." />;
  }

  if (viewState.kind !== "results") {
    return null;
  }

  const { artists, albums } = viewState.results;

  return (
    <Fragment>
      {albums.length > 0 && (
        <CommandGroup heading="Albums">
          {albums.map((album) => {
            return (
              <CommandItem
                key={album.id}
                className="flex items-center gap-3 p-3"
                onSelect={() => onSelect(album)}
              >
                {album.imageUrl ? (
                  <img
                    src={album.imageUrl}
                    alt={album.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{album.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {album.artistName} •{" "}
                    {new Date(album.releaseDate).getFullYear()}
                  </p>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
      {artists.length > 0 && (
        <CommandGroup heading="Artists">
          {artists.map((artist) => {
            return (
              <CommandItem
                key={artist.id}
                className="flex items-center gap-3 p-3"
                onSelect={() => onSelect(artist)}
              >
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{artist.name}</p>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}
    </Fragment>
  );
}

/**
 * Global search input for artists and albums, backed by Spotify search results.
 *
 * @returns The interactive search bar and dropdown results.
 */
export function SearchBar() {
  const {
    searchValue,
    open,
    viewState,
    selectionError,
    setOpen,
    setSearchValue,
    handleSelect,
  } = useSearchBarState();
  const hasSearchValue = searchValue.trim().length > 0;

  return (
    <div className="relative flex-1 max-w-md">
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3 w-full h-10 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <CommandInput
            placeholder="Search for albums or artists..."
            value={searchValue}
            onValueChange={setSearchValue}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="flex w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {open && hasSearchValue && (
          <CommandList className="absolute top-full left-0 right-0 max-h-[400px] overflow-y-auto bg-background border border-t-0 rounded-b-lg shadow-md z-50">
            <SearchResults
              viewState={viewState}
              onSelect={(item) => void handleSelect(item)}
            />
          </CommandList>
        )}
        {selectionError ? (
          <p className="px-3 py-2 text-sm text-destructive" role="alert">
            {selectionError}
          </p>
        ) : null}
      </Command>
    </div>
  );
}
