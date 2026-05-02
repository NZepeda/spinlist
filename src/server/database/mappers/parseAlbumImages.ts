import type { Json } from "@/server/database";
import type { Image } from "@/shared/types/domain/image";

/**
 * Extracts valid image records from untyped JSON data.
 */
export function parseAlbumImages(images: Json): Image[] {
  const rawImages = Array.isArray(images) ? images : [];

  return rawImages.flatMap((image) => {
    if (image === null || typeof image !== "object") {
      return [];
    }

    if (Array.isArray(image)) {
      return [];
    }

    const record = image as Record<string, unknown>;

    if (typeof record.url !== "string") {
      return [];
    }

    const height =
      typeof record.height === "number" ? record.height : undefined;
    const width = typeof record.width === "number" ? record.width : undefined;

    return [
      {
        url: record.url,
        height,
        width,
      },
    ];
  });
}
