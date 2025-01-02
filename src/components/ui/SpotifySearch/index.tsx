import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { useOnClickOutside, useDebounceCallback } from "usehooks-ts";
import { useAlbums } from "@/lib/hooks/useAlbums";
import { useRouter } from "next/navigation";

export const SpotifySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryDebounced, setSearchQueryDebounced] = useState("");
  const [didClickOutside, setDidClickOutside] = useState(false);
  const router = useRouter();
  const debouncedSetSearchQuery = useDebounceCallback(
    setSearchQueryDebounced,
    500
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(containerRef, () => {
    setDidClickOutside(true);
  });

  const { albums, error } = useAlbums(searchQueryDebounced);

  if (error) {
    console.error(error);
  }

  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      {/* Search Container - Using relative positioning to anchor the dropdown */}
      <div className="relative">
        <label htmlFor="search" className="sr-only">
          Search
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>

          <input
            id="search"
            name="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Search albums"
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            disabled={Boolean(error)}
            autoComplete="off"
            onFocus={() => setDidClickOutside(false)}
          />
        </div>

        {/* Dropdown Results - Only show when we have results and input is focused */}
        {albums.length > 0 && !didClickOutside && (
          <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-auto z-50">
            <ul className="py-2">
              {
                // @ts-expect-error The Spotify API return types are not fully typed yet.
                albums.map((album) => {
                  const image = album.images.at(-1);
                  return (
                    <li
                      key={album.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                      onClick={() => {
                        router.push(`/album/${album.id}`);
                      }}
                    >
                      {image && (
                        <div className="flex-shrink-0 w-10 h-10">
                          <Image
                            src={image.url}
                            alt={`${album.name} cover`}
                            className="w-full h-full object-cover rounded"
                            width={image.width}
                            height={image.height}
                          />
                        </div>
                      )}

                      {/* Album Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {album.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {album.artists
                            // @ts-expect-error The Spotify API return types are not fully typed yet.
                            .map((artist) => artist.name)
                            .join(", ")}
                        </p>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
