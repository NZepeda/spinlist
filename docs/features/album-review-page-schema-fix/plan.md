# Plan: Album Review Page Schema Fix

## Sequencing notes

- Keep this slice limited to the `/album/[slug]` review read and write path plus its direct shared contracts.
- Treat the rename from `releaseGroupId` to `albumId` as one atomic contract migration for this path rather than adding dual-field compatibility.
- Regenerate `src/server/database/generated/database.types.ts` in the same chunk so application types stop preserving the invalid review field.
- Do not add or update automated tests in this slice.
- Manual verification is the required signoff path for this feature.

## Chunk 1: Migrate The Album Review Page Contract To `album_id`

### Goal

Restore the album review page by moving its end-to-end review contract from legacy release-group semantics to album semantics.

### Scope

- Update album-page server read paths to query reviews by `album_id` instead of `release_group_id`.
- Update the signed-in user review lookup to use album-based query keys and album-based review filters.
- Update client review submission to send `albumId` instead of `releaseGroupId`.
- Update shared review API request and error contracts from `releaseGroupId` to `albumId` and from `RELEASE_GROUP_NOT_FOUND` to `ALBUM_NOT_FOUND`.
- Update `POST /api/reviews` to validate `albumId`, check existence in `albums`, write `album_id`, and update logging, monitoring context, and error messages to album terminology.
- Regenerate `src/server/database/generated/database.types.ts` with `npx supabase gen types typescript --local > src/server/database/generated/database.types.ts`.

### Acceptance criteria

- [ ] The `/album/[slug]` review feed no longer filters reviews with `release_group_id`.
- [ ] The signed-in album review lookup reads the current user review by `album_id`.
- [ ] The client submit path sends `albumId` through the shared request contract.
- [ ] `POST /api/reviews` validates against `albums`, writes `album_id`, and no longer uses release-group-specific contract names on the album-page path.
- [ ] The review API error contract uses `ALBUM_NOT_FOUND` and album-specific messaging for this path.
- [ ] Regenerated database types reflect `reviews.album_id` for the album review path and no longer preserve the stale review field in checked-in types.
- [ ] Manual verification confirms `/album/[slug]` can load the review feed, load the signed-in review state, save a first rating, save composer changes, and surface the renamed album-not-found path correctly.

### Dependencies

- None.

## Manual verification

- Open an album page with existing written reviews and confirm the feed renders.
- Open an album page while signed in and confirm any existing personal review state loads.
- Save a first-time rating for an unrated album and confirm it persists.
- Save composer changes for favorite track and review text and confirm they persist.
- Exercise the not-found failure path and confirm the response contract and messaging use album terminology.
