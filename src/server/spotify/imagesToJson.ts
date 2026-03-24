import type { Json } from "@/server/database";
import type { Image } from "@/shared/types";

/**
 * Type-safe cast for image arrays to Supabase Json type.
 */
export function imagesToJson(images: Image[]): Json {
  return images as unknown as Json;
}
