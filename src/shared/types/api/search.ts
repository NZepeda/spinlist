/**
 * The response shape returned when a search API request fails.
 */
export interface SearchErrorResponseBody {
  error: string;
  eventId?: string;
  requestId: string;
}
