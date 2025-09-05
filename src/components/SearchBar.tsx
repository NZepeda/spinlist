"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchResponse } from "@/lib/types";

async function searchSpotify(query: string): Promise<SearchResponse> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to search");
  }
  return response.json();
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const hasResults =
    data && (data.artists.length > 0 || data.albums.length > 0);

  return (
    <div className="relative flex-1 max-w-md">
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search for albums or artists..."
            value={query}
            onValueChange={setQuery}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {open && query && (
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading && <CommandEmpty>Searching...</CommandEmpty>}
            {error && (
              <CommandEmpty>
                Something went wrong. Please try again.
              </CommandEmpty>
            )}
            {!isLoading && !hasResults && debouncedQuery && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {data?.artists && data.artists.length > 0 && (
              <CommandGroup heading="Artists">
                {data.artists.map((artist) => (
                  <CommandItem
                    key={artist.id}
                    className="flex items-center gap-3 p-3"
                    onSelect={() => {
                      console.log("Selected artist:", artist);
                      setOpen(false);
                    }}
                  >
                    {artist.image ? (
                      <img
                        src={artist.image}
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
                      <p className="text-sm text-muted-foreground">
                        {artist.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data?.albums && data.albums.length > 0 && (
              <CommandGroup heading="Albums">
                {data.albums.map((album) => (
                  <CommandItem
                    key={album.id}
                    className="flex items-center gap-3 p-3"
                    onSelect={() => {
                      console.log("Selected album:", album);
                      setOpen(false);
                    }}
                  >
                    {album.image ? (
                      <img
                        src={album.image}
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
                        {album.artist} •{" "}
                        {new Date(album.release_date).getFullYear()}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
