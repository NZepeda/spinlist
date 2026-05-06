# Album Review Page Schema Fix

## Problem

The production album review page path fails because it still reads and writes review data through legacy `release_group_id` fields even though the current schema defines album reviews through `album_id`.
This mismatch affects `src/app/album/[slug]/page.tsx` and the directly supporting review contracts it depends on, which means the page can break when loading the review feed, loading the current user's review, or saving review changes.

## Goals

- Restore the album review page path so it works against the current `reviews.album_id` schema.
- Update the review read paths used by the album page to consistently identify reviews by album id.
- Update the review write contract used by the album page so create and update actions target albums instead of release groups.
- Rename the review API error contract from release-group terminology to album-specific language where this page path depends on it.
- Regenerate database types so review-related application types no longer include fields that are absent from the current schema.
- Keep the change limited to the album review page path and the supporting API and type contracts it requires.

## Non-goals

- Migrate unrelated release-group-based review flows outside the album review page path.
- Redesign the album review UI or change review-writing behavior beyond the schema fix.
- Change review ranking, feed ordering, or composer UX.
- Introduce broader database refactors or schema changes.

## User value

Listeners can open an album page, see recent written reviews, view their own saved review state, and save rating or review updates without the page failing because of an outdated review schema contract.

## Constraints

- Scope must stay narrow to `src/app/album/[slug]/page.tsx` and directly supporting review read/write code.
- Align behavior with `docs/database_schema.mermaid`, where reviews relate to albums through `album_id`.
- Update the affected contract surface consistently across server reads, client hooks, API request types, and API validation and error handling used by the album page.
- Replace user-facing and contract-facing release-group terminology with album terminology in the affected review API path.
- Regenerate checked-in database types as part of the fix so compile-time contracts match the current schema.
- Preserve existing album review page behavior wherever possible aside from replacing legacy schema references.
- Avoid unrelated refactors in shared review features that are not required for the album page path.

## Acceptance criteria

- [ ] Loading `/album/[slug]` no longer queries `reviews.release_group_id` in the album review page path.
- [ ] `getAlbumReviewFeed` reads reviews by `album_id` and still returns the same page-level feed shape expected by the album page.
- [ ] `useUserAlbumReview` loads the signed-in user's review by `album_id` for the current album.
- [ ] `useAlbumReviewState` and its supporting submit flow send the album-based review identifier expected by the reviews API.
- [ ] `src/app/api/reviews/route.ts` validates, looks up, inserts, and updates album-page review requests using album-based identifiers instead of release-group-based identifiers.
- [ ] `src/shared/types/api/reviews.ts` matches the updated album-based request and response contract, including album-specific not-found error naming.
- [ ] Checked-in database-generated review types no longer expose legacy fields that are absent from the schema.
- [ ] The album review page can load existing reviews and save new or updated reviews without production errors caused by the legacy review schema reference.

## Risks

- The current generated database types may still expose `reviews.release_group_id`, which could create follow-on compile or runtime mismatches if the page path is updated without reconciling the contract boundary carefully.
- Narrowing scope to the album page path could leave other legacy review callers unchanged, so the implementation must avoid accidental breakage outside this slice.
- Error codes and messages that currently reference release groups may become misleading if the API semantics change without corresponding cleanup.

## Assumptions

- The source of truth for the intended relationship is `docs/database_schema.mermaid`, which shows reviews belonging to albums through `album_id`.
- The album review page already has the album id it needs, so no new lookup flow is required.
- No database migration is needed for this slice because the issue is in application code still referencing the legacy schema.
- It is acceptable for this slice to rename API request fields from release-group terminology to album terminology if that is required to keep the page path consistent.

## Open questions

- None.
