# Tech Spec: Album Review Page Schema Fix

## Summary

Fix the album review page by migrating its review contract from legacy `release_group_id` semantics to the current `album_id` schema everywhere on the `/album/[slug]` path: server feed reads, signed-in review lookup, client submit command, shared API types, and `POST /api/reviews`.
This slice should not redesign the review system or migrate unrelated release-group flows.
It should align the narrow album-page path with `docs/database_schema.mermaid` and `supabase/schemas/reviews.sql`, then regenerate checked-in database types so stale generated fields stop reintroducing invalid contracts.

## Perspective debate

### Software architect view

The current failure is a boundary mismatch, not just a bad query.
`src/features/reviews/server/getAlbumReviewFeed.ts` reads with `album.id` but filters `reviews.release_group_id`, while the signed-in flow and API still name the identifier `releaseGroupId`.
That naming leak keeps album-page code coupled to an obsolete ownership model.
The architect position is that the album page path should speak only in album terms from the page boundary down to the route contract.
Keeping album IDs in call sites while preserving release-group naming in hooks and API bodies would leave the system internally incoherent and likely recreate the bug later.

The architect also pushes to regenerate `src/server/database/generated/database.types.ts` in the same slice.
Without that, application code can continue compiling against a non-existent `reviews.release_group_id` field, and the fix would remain structurally fragile.

### Principal engineer view

The main risk is partial migration.
If only `getAlbumReviewFeed` changes, logged-in users still fail in `useUserAlbumReview`, `useAlbumReviewState`, `submitReview`, `src/shared/types/api/reviews.ts`, and `src/app/api/reviews/route.ts`.
The principal engineer argues for one atomic contract update across the album-page read and write path so the page does not mix identifier models.

This perspective also rejects a compatibility shim that accepts both `releaseGroupId` and `albumId` in the route for this slice.
Dual-field support increases ambiguity, expands test surface, and makes it harder to prove the album page no longer depends on legacy fields.
Because the approved scope is narrow and the affected callers are known, the safer path is a clean rename for this path plus targeted verification.

The engineer also calls out route correctness: the handler currently validates `releaseGroupId`, looks up `release_groups`, logs `releaseGroupId`, inserts `release_group_id`, and returns `RELEASE_GROUP_NOT_FOUND`.
All of that must change together, including observability labels that would otherwise mislead production debugging.

### Product engineer view

The product concern is speed and blast radius.
The user-facing goal is simply to make the album page load and save reviews again without changing UI behavior.
That argues against broader review-domain cleanup, shared abstraction rewrites, or migration of other release-group-based surfaces.
The product engineer supports renaming only the contracts directly exercised by `/album/[slug]` and leaving unrelated review flows untouched until separately scoped.

This perspective initially resists regenerating database types if it requires extra setup, but concedes that the brief explicitly requires it and that failing to do so would leave compile-time drift in place.
The product engineer also argues that no database migration is needed because schema files already show `album_id`; the bug is stale application code and stale generated types.

### Debate summary

The main disagreement was whether to do the smallest runtime fix or the smallest coherent contract migration.
The architect and principal engineer rejected a query-only fix and rejected dual support for `releaseGroupId` and `albumId`.
The product engineer pushed to avoid broad cleanup and won that point: this spec stays limited to the album page path and its direct review contracts.
The final recommendation is a narrow but end-to-end contract migration for this path only, with generated database types refreshed as part of the same change.

## Affected areas

- `src/app/album/[slug]/page.tsx`
- `src/features/reviews/server/getAlbumReviewFeed.ts`
- `src/features/reviews/hooks/useUserAlbumReview.ts`
- `src/features/reviews/hooks/useAlbumReviewState.ts`
- `src/features/reviews/commands/submitReview.ts`
- `src/shared/types/api/reviews.ts`
- `src/app/api/reviews/route.ts`
- `src/server/database/generated/database.types.ts`
- `src/server/database/index.ts` consumers through `ReviewRow`
- Verification sources: `docs/database_schema.mermaid`, `supabase/schemas/reviews.sql`

## Architecture

The page boundary remains the same:

1. `src/app/album/[slug]/page.tsx` loads an `AlbumRecord`.
2. `getAlbumReviewFeed(album)` loads written reviews for `album.id`.
3. `AlbumReviewFlow` uses `useUserAlbumReview(album.id)` for the signed-in user.
4. `useAlbumReviewState` submits album-scoped review mutations through `submitReview`.
5. `submitReview` posts an album-scoped request body to `POST /api/reviews`.
6. The route validates `albumId`, confirms the album exists, and inserts or updates `reviews.album_id`.

No new modules are required.
The change is primarily a contract rename and query correction across existing boundaries.

## Data and schema

- Source of truth remains `docs/database_schema.mermaid` and `supabase/schemas/reviews.sql`, both of which define reviews as belonging to albums through `album_id`.
- No new migration is required for this slice unless local schema artifacts are unexpectedly out of sync.
- `src/server/database/generated/database.types.ts` must be regenerated so `ReviewRow` reflects `album_id` and removes `release_group_id`.
- Because `Review` is an alias of `ReviewRow` in `src/shared/types/domain/review.ts`, regenerating database types is part of fixing downstream type safety.

## API and contracts

Recommended contract changes:

- `ReviewRequestBody.releaseGroupId` -> `albumId`
- `ReviewErrorCode.RELEASE_GROUP_NOT_FOUND` -> `ALBUM_NOT_FOUND`
- Error message text should use album-specific language
- Route validation should require `albumId`
- Route album existence lookup should target `albums`, not `release_groups`
- Insert payload should write `album_id`
- Workflow logging and error-monitoring context should use `albumId`

Important constraint:

- This route change should be treated as a narrow contract migration for the album page path, not a backwards-compatible multi-shape endpoint.
- Current repo usage suggests `submitReview` is the only active caller of `POST /api/reviews`, which supports a clean rename inside this slice.
- If unrelated callers still depend on `releaseGroupId`, they are out of scope and should be handled in a separate slice rather than preserved implicitly here.

## State management

No reducer redesign is needed.

Required state updates are limited to identifier semantics:

- `useUserAlbumReview` should query `reviews.album_id` and use album-based query keys.
- `useAlbumReviewState` should pass `album.id` as `albumId` into `submitReview`.
- `submitReview` should serialize `albumId` in the request body.
- Existing reducer behavior, autosave sequencing, composer validation, and optimistic UI patterns should remain unchanged.

## Rollout and migration

- Ship as one application-level slice with no user-facing rollout flag.
- Regenerate checked-in database types in the same PR so runtime and compile-time contracts move together.
- Regenerate database types with `npx supabase gen types typescript --local > src/server/database/generated/database.types.ts`.
- No data backfill or Supabase migration is expected.
- Verify that the narrow slice does not modify unrelated release-group review flows outside the album-page path.

## Testing strategy

Focus on the direct path that broke:

- Do not add new automated tests in this slice.
- Verify the regenerated database types expose `reviews.album_id` and no longer expose the legacy review field.
- Manually verify `/album/[slug]` for feed load, signed-in review load, first rating save, composer save, and the renamed album-not-found error path.
- Treat broader automated test coverage for the review system as intentionally deferred by user decision.

## Tradeoffs

### Recommended approach

Perform a clean album-contract migration for the album review page path only, and regenerate database types in the same slice.

### Main alternative

Patch only `getAlbumReviewFeed` and possibly `useUserAlbumReview`, while leaving the route and shared request types on release-group terminology or temporarily accepting both identifiers.

### Why the recommendation won

A query-only or dual-contract fix is faster in the moment but leaves the same page path split across two ownership models.
That increases risk, keeps observability misleading, and allows stale generated types to continue shaping new code incorrectly.
The recommended approach is still narrow, but it is the smallest change that fully restores the album page and makes the contract internally consistent.

## Open technical questions

- None.
