"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";

import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/select";
import { Textarea } from "@/components/core/textarea";
type Album = {
  id: string;
  title: string;
  artist: string;
  tracks: string[];
};

type FormData = {
  albumId: string;
  rating: number;
  review: string;
  favoriteTrack: string;
  leastFavoriteTrack: string;
};

export default function CreateRatingForm() {
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState<FormData>({
    albumId: "",
    rating: 0,
    review: "",
    favoriteTrack: "",
    leastFavoriteTrack: "",
  });
  const [errors] = useState<Partial<FormData>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement the API call to submit the rating
    console.log(formData);
    // Reset form and selected album after submission
    setFormData({
      albumId: "",
      rating: 0,
      review: "",
      favoriteTrack: "",
      leastFavoriteTrack: "",
    });
    setSelectedAlbum(null);
  };

  const handleSearch = async (query: string) => {
    // TODO: Implement the API call to search for albums
    // This is a mock implementation
    const mockResults: Album[] = [
      {
        id: "1",
        title: "Album 1",
        artist: "Artist 1",
        tracks: ["Track 1", "Track 2", "Track 3"],
      },
      {
        id: "2",
        title: "Album 2",
        artist: "Artist 2",
        tracks: ["Track A", "Track B", "Track C"],
      },
    ];

    setSearchResults(
      mockResults.filter(
        (album) =>
          album.title.toLowerCase().includes(query.toLowerCase()) ||
          album.artist.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleAlbumSelect = (albumId: string) => {
    const album = searchResults.find((a) => a.id === albumId);
    if (album) {
      setSelectedAlbum(album);
      setFormData((prev) => ({ ...prev, albumId: album.id }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <label htmlFor="albumSearch" className="text-sm font-medium">
          Search and select an album
        </label>
        <div className="flex gap-2">
          <Input
            id="albumSearch"
            placeholder="Search for an album"
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-grow"
          />
          <Button type="button">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-2 border rounded-md divide-y">
            {searchResults.map((album) => (
              <li
                key={album.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAlbumSelect(album.id)}
              >
                {album.title} by {album.artist}
              </li>
            ))}
          </ul>
        )}
        {selectedAlbum && (
          <div className="mt-2 p-2 border rounded-md bg-gray-50">
            <p className="font-semibold">{selectedAlbum.title}</p>
            <p className="text-sm text-gray-600">{selectedAlbum.artist}</p>
          </div>
        )}
        {errors.albumId && (
          <p className="text-sm text-red-500">{errors.albumId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <StarRating
          rating={formData.rating}
          onRatingChange={handleRatingChange}
        />
        <p className="text-sm text-gray-500">
          Click once for a full star, twice for a half star. Click again to
          deselect.
        </p>
        {errors.rating && (
          <p className="text-sm text-red-500">{errors.rating}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="review" className="text-sm font-medium">
          Review
        </label>
        <Textarea
          id="review"
          placeholder="Write your review here..."
          className="resize-none"
          value={formData.review}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, review: e.target.value }))
          }
        />
        <p className="text-sm text-gray-500">
          Share your thoughts about the album.
        </p>
        {errors.review && (
          <p className="text-sm text-red-500">{errors.review}</p>
        )}
      </div>

      {selectedAlbum && (
        <>
          <div className="space-y-2">
            <label htmlFor="favoriteTrack" className="text-sm font-medium">
              Favorite Track (Optional)
            </label>
            <Select
              value={formData.favoriteTrack}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, favoriteTrack: value }))
              }
            >
              <SelectTrigger id="leastFavoriteTrack">
                <SelectValue placeholder="Select your favorite track" />
              </SelectTrigger>

              <SelectContent>
                {selectedAlbum.tracks.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="leastFavoriteTrack" className="text-sm font-medium">
              Least Favorite Track (Optional)
            </label>
            <Select
              value={formData.leastFavoriteTrack}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, leastFavoriteTrack: value }))
              }
            >
              <SelectTrigger id="leastFavoriteTrack">
                <SelectValue placeholder="Select your least favorite track" />
              </SelectTrigger>
              <SelectContent>
                {selectedAlbum.tracks.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <Button type="submit">Submit Rating</Button>
    </form>
  );
}
