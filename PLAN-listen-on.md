# Listen On Backend Plan

## Summary
Build backend support for album streaming links with `spotify` and `apple_music` first, while keeping the architecture provider-based so additional platforms can be added later without changing the album hydration flow.

## Status
- Current phase: awaiting approval for Phase 2
- Overall status: Phase 1 completed

## Phase 1: Schema and Type Contract
### Goal
Define a stable persistence contract for album streaming links so the rest of the backend can read and write one typed shape.

### Planned changes
- Add `streaming_links jsonb not null default '{}'::jsonb` to `albums`
- Add `streaming_links_synced_at timestamptz null` to `albums`
- Extend the generated Supabase types for the new columns
- Extend the album domain model with:
  - `StreamingPlatform = "spotify" | "apple_music"`
  - `AlbumStreamingLinks = Partial<Record<StreamingPlatform, string>>`
  - `streaming_links: AlbumStreamingLinks`
- Update the album row mapper to parse and validate the stored JSON safely

### Acceptance criteria
- An album row can persist streaming links without breaking existing reads
- The album domain object exposes a typed `streaming_links` field
- Invalid JSON values are ignored safely rather than crashing mapping

### Completion update template
- Status: completed
- Completed work:
  - Added album schema columns for `streaming_links` and `streaming_links_synced_at`
  - Generated the migration file `20260316211019_add_album_streaming_links.sql` from the declarative schema diff
  - Reset the local Supabase database so the new migration was applied
  - Regenerated `src/lib/types/generated/database.types.ts` from the local database via `pnpx supabase gen types typescript --local`
  - Extended domain album types with typed streaming link support
  - Updated the album mapper to validate and parse supported platform URLs safely
  - Added mapper tests covering valid and invalid streaming link payloads
  - Updated existing album test fixtures to include the new `streaming_links` contract
  - Ran `pnpx supabase db push --dry-run` and confirmed the new migration is the only pending remote push
- Notes:
  - Phase 1 only defines storage and type contracts; no provider fetching logic is included yet
  - The stored JSON shape is restricted to `spotify` and `apple_music` keys in the mapper
  - Targeted Vitest verification passed for the mapper and affected album consumers after the generated DB types were refreshed
  - The remote schema was not pushed in Phase 1; only the dry-run preview was executed
- User-approved to continue: no

## Phase 2: Provider-Based Link Resolution
### Goal
Introduce a small provider architecture that resolves album links by platform without coupling album hydration to platform-specific code.

### Planned changes
- Add a provider interface for album link resolution
- Add a small provider registry that executes enabled providers
- Implement `spotify` provider:
  - derive the canonical Spotify album URL from the Spotify album payload or ID
- Implement `apple_music` provider:
  - use Spotify album UPC
  - query Apple Music Catalog API with `APPLE_MUSIC_DEVELOPER_TOKEN`
  - use `APPLE_MUSIC_STOREFRONT`, defaulting to `us`
- Normalize results into one `AlbumStreamingLinks` object

### Acceptance criteria
- Providers resolve to a shared links shape
- Spotify resolution works even if Apple lookup fails
- Apple resolution returns `null` cleanly when UPC is missing or no match exists

### Completion update template
- Status: pending
- Completed work:
- Notes:
- User-approved to continue: no

## Phase 3: Album Hydration Integration
### Goal
Reuse the existing album ingest flow so links are populated through the same backend path that already caches album metadata.

### Planned changes
- Extract a shared album hydration function that:
  - fetches full Spotify album metadata
  - resolves provider links
  - upserts album metadata, tracks, label, images, `streaming_links`, and `streaming_links_synced_at`
- Update `getOrCreateAlbumSlug` to use the shared hydration path
- Update album retrieval flow so existing lightweight rows are enriched when needed
- Keep `syncAlbums` lightweight and seed-only
- Apply v1 refresh policy:
  - resolve links only until first successful sync
  - skip re-fetch once `streaming_links_synced_at` is present

### Acceptance criteria
- New albums get links during hydration
- Existing lightweight rows are enriched on first full hydrate
- Artist sync remains fast and does not resolve Apple links
- Album hydration does not re-fetch links after first successful sync

### Completion update template
- Status: pending
- Completed work:
- Notes:
- User-approved to continue: no

## Phase 4: Validation and Failure Handling
### Goal
Prove that the new backend flow is safe when provider lookups succeed, partially succeed, or fail.

### Planned changes
- Add mapper tests for valid and invalid `streaming_links`
- Add hydration tests for:
  - new album with both links
  - existing lightweight row enrichment
  - Spotify-only persistence when UPC is missing
  - Apple lookup failure without blocking album persistence
  - no re-fetch after first successful sync
- Add provider tests for:
  - Spotify canonical URL resolution
  - Apple storefront usage
  - Apple no-match behavior

### Acceptance criteria
- Failing Apple lookups do not break album persistence
- Partial link payloads are stored safely
- The backend exposes a stable typed shape to the frontend

### Completion update template
- Status: pending
- Completed work:
- Notes:
- User-approved to continue: no

## Environment and Config
- Add `APPLE_MUSIC_DEVELOPER_TOKEN`
- Add `APPLE_MUSIC_STOREFRONT`, default `us`

## Not in Scope
- YouTube Music and Amazon Music implementations
- Per-user storefront selection
- Background backfill for existing albums
- Fuzzy Apple title/artist matching when UPC is missing
- Frontend `Listen on` UI

## Phase Workflow
- Before starting each phase, explain the phase goal and exact code areas that will change
- Complete only one phase at a time
- After each phase, update `PLAN-listen-on.md`:
  - mark phase status
  - summarize completed work
  - capture any decisions or deviations
- Stop after each phase and wait for approval before moving on
