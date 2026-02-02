import { SpotifyImage } from "@/lib/types/spotify.types";

/**
 * Index mapping for image sizes to their respective positions in the Spotify images array.
 *
 * NOTE: This mapping assumes that Spotify returns images in descending order of size.
 */
const SIZE_IMAGE_INDEX = {
  large: 0,
  medium: 1,
  small: 2,
};

/**
 * Extracts the URL of the image from a Spotify images array.
 * If the given size is not available, it returns the first available image.
 */
export function getImageUrl(
  images: SpotifyImage[],
  size: "large" | "medium" | "small" = "large",
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  let image = images[SIZE_IMAGE_INDEX[size]];

  if (!image) {
    // return the first available image
    image = images[0];
  }

  return image.url;
}
