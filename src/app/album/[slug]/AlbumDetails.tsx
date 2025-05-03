import Image from "next/image";
import TrackList from "./TrackList";
import { Database } from "@/lib/types/supabase.types";

type DatabaseAlbum = Database["public"]["Tables"]["albums"]["Row"];

/**
 * Displays the details of an album.
 * @returns The AlbumDetails component.
 */
export const AlbumDetails = ({ album }: { album: DatabaseAlbum }) => {
  const { title, artist, cover_url, release_date, tracks = [] } = album;

  return (
    <div className="space-y-8 p-8 rounded-lg">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          {cover_url && (
            <Image
              src={cover_url}
              alt={`${title} artwork`}
              width={300}
              height={300}
              className="rounded-lg shadow-lg"
            />
          )}
        </div>
        <div className="w-full md:w-2/3 space-y-4">
          <h1>{title}</h1>
          <p className="text-xl">{artist}</p>
          <p>{release_date}</p>
        </div>
      </div>

      <TrackList
        tracks={tracks.map((track) => track.name)}
        isLoggedIn={false}
      />
    </div>
  );
};
