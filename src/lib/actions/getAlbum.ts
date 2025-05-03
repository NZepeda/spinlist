import { getAlbumFromDatabase } from "./getAlbumFromDatabase";
import { getAlbumFromSpotify } from "./getAlbumFromSpotify";

/**
 * Gets an album from Spotify.
 * @param albumId The ID of the album to get.
 * @param token The Spotify token to use. If not provided, it will be fetched from the server.
 * @returns The album.
 */
export const getAlbum = async (albumId: string, token?: string) => {
  const albumFromDatabase = await getAlbumFromDatabase(albumId);

  if (albumFromDatabase) {
    return albumFromDatabase;
  }

  const albumFromSpotify = await getAlbumFromSpotify(albumId, token);

  if (albumFromSpotify) {
    return albumFromSpotify;
  }

  return null;
};
