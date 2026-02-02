import { Json } from "../types/database.types";
import { SpotifyImage } from "../types/spotify.types";

/**
 * Type-safe cast for SpotifyImage array to Supabase Json type.
 */
export function imagesToJson(images: SpotifyImage[]): Json {
  return images as unknown as Json;
}
