import type { Json } from "@/lib/types/db";
import type { Image } from "@/lib/types";

/**
 * Type-safe cast for image arrays to Supabase Json type.
 */
export function imagesToJson(images: Image[]): Json {
  return images as unknown as Json;
}
