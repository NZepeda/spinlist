import { Heart } from "lucide-react";

type TrackListProps = {
  tracks: string[];
  isLoggedIn: boolean;
  favoriteTrack: string | null;
  onFavoriteSelect: (track: string) => void;
};

export default function TrackList({
  tracks,
  isLoggedIn,
  favoriteTrack,
  onFavoriteSelect,
}: TrackListProps) {
  return (
    <div className="space-y-4 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">Track List</h2>
      <ul className="space-y-2">
        {tracks.map((track, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-3 rounded-lg shadow"
          >
            <span>
              {index + 1}. {track}
            </span>
            {isLoggedIn && (
              <button
                onClick={() => onFavoriteSelect(track)}
                className="focus:outline-none"
                aria-label={
                  favoriteTrack === track
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Heart
                  className={`w-6 h-6 ${
                    favoriteTrack === track
                      ? "text-black-500 fill-current"
                      : "text-black-400"
                  }`}
                />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
