/**
 * Shared slug response shape used by album and artist slug lookups.
 */
export interface SlugSuccessResponse {
  requestId: string;
  slug: string;
}

/**
 * Artist sync outcome returned with successful artist slug lookups.
 */
export type ArtistSlugSyncStatus = "fresh" | "refresh_queued" | "synced";

/**
 * Artist-specific slug response returned after artist lookup and sync decisions.
 */
export interface ArtistSlugSuccessResponse extends SlugSuccessResponse {
  syncStatus: ArtistSlugSyncStatus;
}

/**
 * Artist sync failure code returned when artist routing must stop.
 */
export type ArtistSlugFailureCode = "ARTIST_SYNC_FAILED";

/**
 * Artist-specific slug failure returned when the selected artist is not usable locally.
 */
export interface ArtistSlugFailureResponse {
  code: ArtistSlugFailureCode;
  error: string;
  eventId?: string;
  requestId: string;
}

/**
 * Generic slug failure returned when lookup parameters or infrastructure fail.
 */
export interface SlugErrorResponseBody {
  error: string;
  eventId?: string;
  requestId: string;
}
