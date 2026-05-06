const ARTIST_DISCOGRAPHY_STALE_TIME_MS = 2 * 60 * 60 * 1000; // 2 Hours

/**
 * Returns whether an artist discography sync timestamp should be refreshed.
 *
 * @param lastSyncedAt - The last successful discography sync time.
 * @returns Whether the stored discography should be treated as stale.
 */
export function isArtistDiscographyStale(lastSyncedAt: string | null): boolean {
  if (lastSyncedAt === null) {
    return true;
  }

  const syncedAtMs = Date.parse(lastSyncedAt);

  if (Number.isNaN(syncedAtMs)) {
    return true;
  }

  return Date.now() - syncedAtMs >= ARTIST_DISCOGRAPHY_STALE_TIME_MS;
}
