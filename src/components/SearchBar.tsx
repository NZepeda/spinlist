"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui-core/command";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchResponse, SearchAlbum, SearchArtist } from "@/lib/types/search";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateAlbumSlug } from "@/lib/slugs/getOrCreateAlbumSlug";
import { getOrCreateArtistSlug } from "@/lib/slugs/getOrCreateArtistSlug";
import { getImageUrl } from "@/lib/spotify/getImageUrl";
import {
  SpotifyAlbumSimplified,
  SpotifyArtistFull,
} from "@/lib/types/spotify.types";

async function searchSpotify(query: string): Promise<SearchResponse> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to search");
  }
  return response.json();
}

interface SearchResultProps {
  results?: SearchResponse;
  isLoading: boolean;
  error: Error | null;
  onSelect: (
    item: SpotifyArtistFull | SpotifyAlbumSimplified,
    type: "artist" | "album",
  ) => void;
}

const SearchResults = (props: SearchResultProps) => {
  const { results, isLoading, error, onSelect } = props;
  if (isLoading) {
    return <CommandEmpty>Searching...</CommandEmpty>;
  }

  if (error) {
    return <CommandEmpty>Something went wrong. Please try again.</CommandEmpty>;
  }

  const { artists = [], albums = [] } = results || {};

  const hasResults = artists.length > 0 || albums.length > 0;

  if (!hasResults) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <Fragment>
      {albums.length > 0 && (
        <CommandGroup heading="Albums">
          {albums.map((album) => {
            const imageUrl = getImageUrl(album.images, "small");
            const albumArtist = album.artists
              .map((artist) => artist.name)
              .join(", ");
            return (
              <CommandItem
                key={album.id}
                className="flex items-center gap-3 p-3"
                onSelect={() => onSelect(album, "album")}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
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
                    {albumArtist} • {new Date(album.release_date).getFullYear()}
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
            const artistImageUrl = getImageUrl(artist.images, "small");
            return (
              <CommandItem
                key={artist.id}
                className="flex items-center gap-3 p-3"
                onSelect={() => onSelect(artist, "artist")}
              >
                {artistImageUrl ? (
                  <img
                    src={artistImageUrl}
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
};

export function SearchBar() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(searchValue, 300);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchSpotify(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  /**
   * Accepts a selected search item and navigates to its page.
   * From the selected item, it retrieves the appropriate slug.
   */
  const handleSelect = async (
    item: SpotifyArtistFull | SpotifyAlbumSimplified,
  ) => {
    setSearchValue("");
    setOpen(false);

    const response = await fetch(
      `/api/slug?spotifyId=${item.id}&type=${item.type}`,
    );

    const data = await response.json();

    const { slug } = data;

    router.push(`/${item.type}/${slug}`);
  };

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
        {open && searchValue && (
          <CommandList className="absolute top-full left-0 right-0 max-h-[400px] overflow-y-auto bg-background border border-t-0 rounded-b-lg shadow-md z-50">
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              onSelect={handleSelect}
            />
          </CommandList>
        )}
      </Command>
    </div>
  );
}
