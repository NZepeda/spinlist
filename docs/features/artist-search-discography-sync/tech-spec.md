# Technical Spec: Artist Search Discography Sync

## Proposed architecture

Extend the existing artist slug resolution path so artist search selection guarantees a usable local discography only for missing or incomplete artists, while stale existing artists refresh asynchronously.

The primary server entry point remains `src/server/slugs/getOrCreateArtistSlug.ts`.
That module should be expanded from a simple artist-row lookup into a small orchestration layer that:

- loads the current artist record by `spotify_id`
- determines whether the artist is new, fresh, stale, or incomplete
- creates or updates the artist profile row as needed
- synchronously syncs album records and `album_artists` relationships when the artist is missing or incomplete
- schedules a refresh when the artist is stale but already usable
- records the timestamp of the last successful discography sync
- returns the slug on success
- throws a typed failure when the artist is missing or incomplete and sync fails

To keep responsibilities readable, the sync logic should be extracted into artist-focused server helpers rather than expanded inline inside the slug file.

Recommended helper split:

- `src/server/artists/syncArtistDiscography.ts`
  - owns the synchronous import or refresh workflow for one artist
- `src/server/artists/hasStoredArtistAlbums.ts`
  - checks whether an artist already has at least one related album
- `src/server/artists/isArtistDiscographyStale.ts`
  - evaluates the 2-hour freshness rule
- `src/server/artists/upsertArtistAlbums.ts`
  - persists album rows and artist-album relationships idempotently
- `src/server/artists/queueArtistDiscographyRefresh.ts`
  - starts non-blocking refresh work for stale existing artists
- `src/server/artists/errors.ts`
  - defines typed hard-failure outcomes used by the slug route and client behavior

## Data model changes

Add a dedicated timestamp column on `artists` for discography freshness.

Recommended column:

- `discography_last_synced_at timestamptz null`

Behavior:

- `null` means the artist has never completed a successful discography sync and must be treated as stale or incomplete
- a value older than 2 hours means a refresh is required before routing completes
- a value within 2 hours means the existing discography can be used without a refresh

Notes:

- This spec assumes the normalized storage remains `artists`, `albums`, and `album_artists`.
- `AGENTS.md` is authoritative in this repo.
- The data-model source of truth is `docs/database_schema.mermaid`, and the table schemas live under `supabase/schemas`.
- Schema changes in this slice should update the Supabase schema files, update `docs/database_schema.mermaid`, and produce a reviewed SQL migration in `supabase/migrations`.

## Sync algorithm

Recommended artist selection flow:

1. `/api/slug?type=artist` calls `getOrCreateArtistSlug`.
2. `getOrCreateArtistSlug` queries the artist row by Spotify ID and, if present, also inspects:
   - `slug`
   - `discography_last_synced_at`
   - whether at least one album already exists through `album_artists`
3. If the artist does not exist:
   - fetch Spotify artist profile
   - create the canonical artist row
   - fetch the artist's Spotify albums
   - upsert albums and artist relationships
   - set `discography_last_synced_at` on success
   - return the slug
4. If the artist exists and the discography is fresh:
   - return the slug immediately
5. If the artist exists, has at least one stored album, and the discography is stale:
   - return the slug immediately
   - trigger one background refresh attempt
6. If the artist exists but has zero stored albums:
   - treat the record as incomplete
   - attempt a synchronous sync
   - if sync fails, throw a typed hard failure so the client does not route

## Album persistence strategy

Use idempotent writes so repeated refreshes do not create duplicate album rows or duplicate artist relationships.

Recommended rules:

- identify albums by `spotify_id`
- reuse existing album rows when the Spotify album already exists
- update mutable album fields during refresh when Spotify data changes
- ensure the `album_artists` join row exists for the selected artist and album
- preserve deterministic `position` values for artist credits

Because the current artist page is album-only and ordered from stored rows, sync only albums from Spotify's artist albums endpoint.

Important implementation detail:

- `getArtistAlbumsFromSpotify` currently returns `AlbumSummaryDTO`, which is too lightweight for reliable persistence because it lacks fields such as tracklist and UPC that the `albums` table already stores.
- The implementation should either add a richer Spotify album sync helper or extend the current Spotify fetching path so persistence works from complete album data rather than UI DTOs.

## API contract changes

The current client route only interprets `slug` success or a generic HTTP failure.
To support the new routing rules cleanly, return a more expressive response for artist lookups.

Recommended response shape on success:

```ts
interface ArtistSlugSuccessResponse {
  slug: string;
  requestId: string;
  syncStatus: "fresh" | "synced" | "refresh_queued";
}
```

Recommended response shape on failure:

```ts
interface ArtistSlugFailureResponse {
  requestId: string;
  error: string;
  code: "ARTIST_SYNC_FAILED";
}
```

Client behavior:

- `slug` present: route to `/artist/[slug]`
- non-OK response from the artist slug endpoint: do not route and show the Sonner toast
- generic non-artist slug failures can preserve the existing inline selection error fallback

This keeps artist-selection failure handling simple while avoiding a mixed endpoint-specific flag model.

## Client integration

Client work is intentionally narrow:

- add Sonner dependency and mount the toaster in `src/app/layout.tsx`
- update `src/features/search/hooks/useSearchSelection.ts` to:
  - treat failures from artist slug requests as toast-worthy by default
  - optionally parse the typed artist failure response for logging or diagnostics
  - keep returning `null` so routing stops
  - preserve existing generic inline error behavior for unrelated failures such as album slug resolution

No new search UI state is required in the desktop or mobile components if the hook owns the toast and continues to expose the generic `selectionError` state for everything else.

## Error model

Use typed server errors rather than relying on string inspection.

Recommended cases:

- `ArtistSyncHardFailureError`
  - artist was missing or incomplete and sync failed
  - route must stop

The slug route should catch this case explicitly so the response semantics stay deterministic.

## Background refresh execution

Use the Next.js `after(...)` hook to schedule stale artist refresh work after the slug response has been returned.

Why this choice:

- keeps stale refresh off the critical navigation path
- avoids introducing separate job infrastructure in this slice
- stays within framework primitives already available in the app

Implementation guidance:

- keep a thin wrapper such as `queueArtistDiscographyRefresh`
- implement that wrapper with `after(...)`
- keep the wrapper narrow so the execution backend can later move to a durable job system without changing search-flow callers

## Testing strategy

Do not add or update automated tests in this slice.
The project test suite will be reworked separately, so this implementation should focus on production behavior and keep code boundaries clean enough for later coverage.

## Rollout and migration implications

- database migration required for `artists.discography_last_synced_at`
- `supabase/schemas/artists.sql` and `docs/database_schema.mermaid` must be updated to reflect the new column
- generated database types must be refreshed after the schema change
- Sonner becomes a new app-wide dependency and root layout concern

## Recommended approach

Recommended approach: use a hybrid gate.
Synchronously create and import only when the artist is missing or incomplete.
Route immediately for existing artists with usable albums, and queue stale refresh work in the background.

Why:

- it preserves the required hard failure rule for missing or incomplete artists
- it removes unnecessary navigation latency for existing artists
- it centralizes the routing decision where the slug is already resolved
- it gives the system a cleaner migration path toward durable async ingestion later

Main downside:

- background execution adds reliability and observability concerns that do not exist in a purely synchronous flow

## Main alternative

Alternative: keep the entire sync synchronous in `/api/slug`, even for stale existing artists.

Why not recommended:

- it makes every stale artist click pay refresh latency
- it couples navigation too tightly to Spotify availability for the common existing-artist case
