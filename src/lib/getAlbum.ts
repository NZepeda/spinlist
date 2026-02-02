import { getSpotifyToken } from "./getSpotifyToken";
import { resolveAlbumSlug } from "./slugs/resolveAlbumSlug";
import { getSpotifyAlbum } from "./spotify/getSpotifyAlbum";
import { createClient } from "./supabase/server";
import { Database } from "./types/database.types";

type Album = Omit<
  Database["public"]["Tables"]["albums"]["Row"],
  "created_at" | "last_synced_at" | "tracks"
> & {
  tracks: {
    id: string;
    name: string;
    track_number: number;
    duration_ms: number;
  }[];
};

/**
 * Returns the database entry for  the album of the given id.
 * Attempts to retrieve from our database first, and falls back to Spotify if it cannot be found.
 */
export async function getAlbum(slug: string): Promise<Album | undefined> {
  const supabase = await createClient();

  const slugMetadata = await resolveAlbumSlug(supabase, slug);

  if (!slugMetadata) {
    // We cannot resolve the URL being accessed if we don't have the slug metadata.
    return undefined;
  }

  const albumId = slugMetadata.album_id;

  const { data: album, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", albumId)
    .single();

  if (error) {
    throw error;
  }

  if (album) {
    // TODO Fix this
    // @ts-expect-error
    return album;
  }

  // We don't have the album information directly in our database. Grab it from Spotify.
  const spotifyAlbum = await getSpotifyAlbum(slugMetadata.spotify_id);

  if (!spotifyAlbum) {
    return undefined;
  }

  return {
    id: spotifyAlbum.id,
    title: spotifyAlbum.name,
    artist: spotifyAlbum.artists[0]?.name || "Unknown Artist",
    images: spotifyAlbum.images.map((image) => {
      return {
        url: image.url,
        width: image.width,
        height: image.height,
      };
    }),
    release_date: spotifyAlbum.release_date,
    tracks: spotifyAlbum.tracks.items.map(
      (track: {
        id: string;
        name: string;
        track_number: number;
        duration_ms: number;
      }) => ({
        id: track.id,
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
      }),
    ),
    avg_rating: null,
    spotify_id: spotifyAlbum.id,
    review_count: 0,
  };
}
