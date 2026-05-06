# Plan: Artist Search Discography Sync

## Sequencing notes

- Keep the existing search-click flow intact and concentrate the new behavior behind the artist slug endpoint.
- Establish the persistence and sync primitives before changing client error handling so the API contract stays grounded in real server behavior.
- Keep stale refresh queueing behind a thin wrapper even though `after(...)` is the chosen backend.
- Avoid unrelated search UI refactors in this slice.
- Do not add or update automated tests in this feature slice.
- Pause after Chunk 1 so the local database can be updated to the new schema before any later chunks proceed.

## Chunk 1: Add Artist Discography Sync Persistence

### Goal

Introduce the database support required to track artist discography freshness.

### Scope

- Add `discography_last_synced_at` to the artist schema through the repo's Supabase-first workflow.
- Update `supabase/schemas/artists.sql` for the new column.
- Update `docs/database_schema.mermaid` so the documented data model stays aligned.
- Add a reviewed SQL migration under `supabase/migrations`.
- Refresh generated database types after the schema change.

### Acceptance criteria

- [ ] The database can represent whether an artist discography has never synced, is fresh, or is stale.
- [ ] Generated database types reflect the new artist discography sync timestamp field.

### Dependencies

- None.

### Pause after completion

After Chunk 1 is implemented, stop and ask the user to update the local database before continuing.

Expected local update commands:

```bash
pnpm exec supabase db reset
```

Do not begin Chunk 2 until the user explicitly confirms approval to continue after running the local database update workflow.

## Chunk 2: Add Artist Sync Helpers And Spotify Sync Input

### Goal

Introduce the server-side primitives needed to evaluate artist sync state and persist album-only discography results safely.

### Scope

- Add artist-focused persistence helpers for:
  - checking whether an artist already has stored albums
  - evaluating staleness from the sync timestamp
  - upserting artist album rows and relationships idempotently
- Add a richer Spotify artist album sync input path if the current lightweight DTO path is not sufficient for persistence.

### Acceptance criteria

- [ ] Server helpers exist to determine if an artist already has at least one stored album.
- [ ] Server helpers can evaluate whether an artist discography is stale from the sync timestamp.
- [ ] Server helpers can persist album-only artist sync results without creating duplicate albums or duplicate join rows.
- [ ] The sync persistence path can record a successful `discography_last_synced_at` value.

### Dependencies

- Chunk 1.

## Chunk 3: Implement Hybrid Artist Slug Sync Orchestration

### Goal

Make the artist slug resolution path enforce synchronous creation for missing or incomplete artists and queue stale refresh work for existing usable artists.

### Scope

- Expand `src/server/slugs/getOrCreateArtistSlug.ts` into an orchestration layer backed by focused artist sync helpers.
- Add a typed hard-failure error for missing or incomplete artist sync failures.
- Implement synchronous import behavior for:
  - brand-new artists
  - existing artists with zero stored albums
- Implement immediate routing behavior for:
  - fresh existing artists
  - stale existing artists that already have albums
- Add `queueArtistDiscographyRefresh` using Next.js `after(...)`.
- Update the artist slug API route to return the richer success and failure payloads for artist requests.

### Acceptance criteria

- [ ] New artists are created and fully synced before the slug is returned.
- [ ] Existing artists with zero albums are treated as incomplete and block routing until sync succeeds.
- [ ] Existing artists with albums return their slug immediately.
- [ ] Existing stale artists queue a background refresh through `after(...)`.
- [ ] Hard artist sync failures return the typed artist failure response from the API route.

### Dependencies

- Chunk 2.

## Chunk 4: Add Artist-Specific Toast Handling In Search Selection

### Goal

Update the shared client selection flow so artist slug endpoint failures surface through Sonner while preserving current non-artist selection behavior.

### Scope

- Add Sonner as a dependency if it is not already present.
- Mount the Sonner toaster in `src/app/layout.tsx`.
- Update `src/features/search/hooks/useSearchSelection.ts` so:
  - artist slug request failures toast and stop routing
  - generic non-artist slug failures keep using the existing inline selection error path
- Keep desktop and mobile search components unchanged unless a small wiring adjustment is required.

### Acceptance criteria

- [ ] Artist slug endpoint failures show the approved toast and do not route.
- [ ] Album slug failures continue using the existing inline selection error handling.
- [ ] Successful artist selections still route through the shared search controller.

### Dependencies

- Chunk 3.
