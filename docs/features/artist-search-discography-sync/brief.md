# Artist Search Discography Sync

## Problem

Searching for an artist can route to an artist page before the local database has a complete and fresh discography for that artist.
This creates a gap between what the user expects after selecting a search result and what the artist page can actually show.
The current artist slug flow only creates the base artist row and does not guarantee that albums are present or up to date.

## Goals

- Ensure artist search selection routes to an artist page backed by local database records instead of an incomplete placeholder artist.
- Populate a new artist's profile and album discography before routing completes.
- Refresh an existing artist's album discography when the stored sync is older than 2 hours without blocking navigation when usable local data already exists.
- Preserve a successful route to the artist page when a stale refresh fails but the existing artist already has at least one album stored.
- Show a clear toast when the request cannot be completed for an artist that is missing a usable local discography.

## Non-goals

- Sync EPs or singles.
- Redesign the artist page layout.
- Add a background sync system outside the existing search-click flow.
- Change album search behavior.

## User value

When a listener selects an artist from search, the app reliably opens an artist page with a complete album discography or clearly explains that the request could not be completed.

## Constraints

- Extend the existing flow centered on `src/server/slugs/getOrCreateArtistSlug.ts`.
- Treat an artist discography as stale after 2 hours.
- If sync fails for a new or incomplete artist record, do not route and show a Sonner toast.
- If an existing artist already has at least one album, route immediately and treat any stale refresh as a background concern.
- A successful sync routes to the artist page.
- Use the Next.js `after(...)` hook for stale background refresh execution.
- Follow the current search flow in `src/app/api/slug/route.ts` and `src/features/search/hooks/useSearchSelection.ts`.
- The repository currently has no Sonner integration, so the app shell will need a toast host.
- Do not add or update automated tests in this slice.

## Acceptance criteria

- [ ] Selecting an artist from search creates the artist record and album discography when the artist does not already exist.
- [ ] Selecting an existing artist from search routes immediately when at least one album already exists locally.
- [ ] Selecting an existing artist from search triggers a background refresh when the last successful discography sync is older than 2 hours.
- [ ] Selecting an existing artist from search skips the refresh when the last successful discography sync is within 2 hours.
- [ ] A successful artist sync returns the artist slug and routes to `/artist/[slug]`.
- [ ] When sync fails for an artist that does not already have at least one stored album, the app does not route and shows the Sonner toast message `We couldn’t complete that request. Please try again.`
- [ ] When a stale background refresh fails for an existing artist that already has at least one stored album, the app still routes to the artist page without showing an error toast.
- [ ] The database records the timestamp of the last successful artist discography sync.

## Risks

- Background refresh orchestration adds operational complexity compared with a purely synchronous request flow.
- A failed partial sync could leave artist and album tables out of sync if writes are not carefully ordered.
- Spotify album payloads may include duplicates or edge cases that require idempotent persistence rules.

## Assumptions

- Albums are stored in the existing normalized `artists`, `albums`, and `album_artists` tables.
- Album-only scope is sufficient for the artist page and search experience at this stage.
- A dedicated artist-level sync timestamp is the simplest freshness source of truth.

## Open questions

- None at the brief stage.
