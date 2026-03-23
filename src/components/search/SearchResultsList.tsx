"use client";

import { Fragment } from "react";
import { ArrowUpRight, LoaderCircle, Search } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui-core/command";
import type { SearchResultItem } from "@/hooks/useSearchQueryState";
import type { SearchDisplayState } from "./types";

interface SearchResultsListProps {
  displayState: SearchDisplayState;
  onSelect: (item: SearchResultItem) => void;
}

/**
 * Displays a non-interactive status row inside the search results list.
 *
 * @param props - The message to show for the current search state.
 * @returns A styled status row.
 */
function SearchStatusMessage(props: {
  message: string;
  showLoadingIcon?: boolean;
}) {
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
 * Renders the shared search status and result rows for desktop and mobile search components.
 *
 * @param props - The derived display state and result selection handler.
 * @returns The shared search content.
 */
export function SearchResultsList(props: SearchResultsListProps) {
  const { displayState, onSelect } = props;

  if (displayState.kind === "idle") {
    return null;
  }

  if (displayState.kind === "loading" || displayState.kind === "waiting") {
    return <SearchStatusMessage message="Loading results..." showLoadingIcon />;
  }

  if (displayState.kind === "error") {
    return <SearchStatusMessage message={displayState.message} />;
  }

  if (displayState.kind === "empty") {
    return (
      <SearchStatusMessage message="No matches yet. Try a different album or artist." />
    );
  }

  const { artists, albums } = displayState.results;

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
