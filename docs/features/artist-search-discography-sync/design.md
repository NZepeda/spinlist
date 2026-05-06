# Design Brief: Artist Search Discography Sync

## Primary flow

When a user selects an artist result from search, the app keeps the current selection flow but changes the routing rule for existing artists.
If the artist is missing locally, the slug request blocks, creates the artist profile, imports all albums, and then returns the slug.
If the sync for a missing or incomplete artist fails, the client stays on the current screen and shows a Sonner toast.
If the artist already exists locally with at least one album, the client routes immediately after slug resolution.
If that existing artist's discography is stale, the server starts a background refresh instead of blocking navigation.
The artist page renders from local database records, and freshness is improved asynchronously for the next visit or revalidation cycle.

## Screens and surfaces

- Global desktop search dropdown in `src/features/search/components/DesktopSearch.tsx`
- Global mobile search dialog in `src/features/search/components/MobileSearchDialog.tsx`
- Shared search selection logic in `src/features/search/hooks/useSearchSelection.ts`
- Slug resolution API in `src/app/api/slug/route.ts`
- Artist page at `src/app/artist/[slug]/page.tsx`
- Root app shell in `src/app/layout.tsx` for the Sonner toaster host
- Background sync trigger owned by the server-side artist sync path

## States

- Default
  - Search behaves exactly as it does today before an artist result is selected.
- Loading
  - For missing artists, the existing wait-before-route behavior continues while the slug request performs the initial import.
  - For existing artists with usable local albums, no new loading surface is required because routing is not blocked by stale refresh work.
- Empty
  - No search-result changes are required.
- Error
  - If the selected artist cannot be initially synced and does not already have at least one stored album, the search UI stays in place and a Sonner toast communicates the failure.
  - Artist slug endpoint failures should use the Sonner toast as the user-facing feedback channel so the experience does not show duplicate failure messaging for the same event.
- Success
  - The client routes to `/artist/[slug]`.
  - The artist page renders against local database records.
  - Existing stale artists can route successfully before the background refresh finishes.

## Interactions

- Entry points
  - Desktop search result click
  - Mobile search result click
- Primary actions
  - Select artist result from search
  - Wait for slug resolution and initial sync only when the artist is missing or incomplete
  - Route to artist page when the result is usable
  - Allow stale existing artists to refresh in the background
- Secondary actions
  - Retry by selecting the same or another artist again after a toast failure
- Validation and feedback
  - Success is expressed by navigation to the artist page.
  - Hard failure for a missing or incomplete artist record is expressed with the Sonner toast `We couldn’t complete that request. Please try again.`
  - No user-facing feedback is required for a stale background refresh failure in this slice.

## Edge cases

- Existing artist row with no albums should be treated as incomplete and should not silently route on sync failure.
- Existing artist row with a fresh discography should skip the refresh and route normally.
- Existing artist row with stale data should route normally and trigger one background refresh attempt.
- Duplicate album results from Spotify should not create duplicate album relationships in the local discography.
- If sync work partially completes and then fails, the next selection should still be able to recover.
- Mobile and desktop search should share the same outcome rules.

## Accessibility notes

- Sonner toast content should be readable by assistive technology and should not be the only place where focus moves unexpectedly.
- Error feedback should remain concise and understandable without requiring visual context.
- Search interaction should remain keyboard-accessible on both desktop and mobile after the new error handling is added.

## Open design questions

- None at the design stage.
