/**
 * Extracts the URL of the largest image from a Spotify images array.
 * Images are compared by height to determine the largest.
 *
 * @param images - Array of Spotify image objects with url, height, and width
 * @returns The URL of the largest image, or null if the array is empty
 */
export function getLargestImageUrl(
  images: { url: string; height: number; width: number }[]
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  let largest = images[0];

  for (const img of images) {
    if (img.height > largest.height) {
      largest = img;
    }
  }

  return largest.url;
}
