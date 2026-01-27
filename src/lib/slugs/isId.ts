/**
 * Determines whether the given `value` is an ID (Spotify ID or UUID) or a slug.
 * Spotify IDs are exactly 22 alphanumeric characters.
 * UUIDs follow the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 * @param value - The URL parameter to check
 * @returns true if the value is a Spotify ID or UUID, false if it's a slug
 *
 * @example
 * isId("4Z8W4fKeB5YxbusRsdQVPb") // true (22-char Spotify ID)
 * isId("550e8400-e29b-41d4-a716-446655440000") // true (UUID)
 * isId("turnstile") // false (slug)
 */
export function isId(value: string): boolean {
  const spotifyIdPattern = /^[a-zA-Z0-9]{22}$/;
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return spotifyIdPattern.test(value) || uuidPattern.test(value);
}