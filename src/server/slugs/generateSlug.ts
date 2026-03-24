/**
 * Converts a name to a URL-safe slug.
 * Removes special characters, replaces spaces with hyphens, and lowercases.
 *
 * @param name - The name to convert to a slug
 * @returns A URL-safe slug string
 *
 * @example
 * generateSlug("The National") // "the-national"
 * generateSlug("AC/DC") // "ac-dc"
 * generateSlug("Björk") // "bjork"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (é → e, ü → u)
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}
