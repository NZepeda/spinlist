# Album Page Engagement TODO

Goal: turn the album page into a unified "Log this album" flow that increases review conversion by combining rating, optional favorite song selection, and optional review text.

## Phase 1: Server write boundary

- [x] Add a server-backed review write path at `src/app/api/reviews/route.ts`.
- [x] Move review insert/update logic behind that route instead of writing directly from the browser client.
- [x] Validate `favorite_track_id` on the server against the album's stored tracklist before saving.
- [x] Return structured error responses for invalid favorite track, auth failure, and generic save failure.
- [x] Keep create and update behavior compatible with the existing `reviews` table shape.

### Done when

- [x] The client no longer writes reviews directly to Supabase for the main album log flow.
- [x] An invalid `favorite_track_id` is rejected server-side with a user-safe error.
- [x] Existing review updates still work for rating, review text, and favorite song.

## Phase 2: Unified album log state

- [ ] Consolidate the current quick review and full review paths into one album log flow.
- [x] Extend `src/hooks/useReviewForm.ts` to own draft state, existing review hydration, submit state, and error state.
- [ ] Extend `src/hooks/reviewFormReducer.ts` for draft restore, save lifecycle, and clearing favorite song.
- [x] Add local draft persistence keyed by `userId + albumId`.
- [x] Restore unsaved draft state when the user returns to the album page.
- [x] Preserve the draft when submit fails.

### Done when

- [x] No review data is persisted until the user explicitly clicks `Log this album`.
- [x] A failed submit does not clear rating, favorite song, or text.
- [ ] The codebase has one review-entry flow instead of separate quick and full flows.

## Phase 3: Album log UI

- [x] Replace the current quick review card in `src/components/review/ReviewForm.tsx` with a unified `AlbumLogCard`.
- [x] Keep `src/components/review/ReviewSection.tsx` as the auth gate, but render the new album log UI for signed-in users.
- [x] Make `Log this album` the primary CTA.
- [x] Support the following states in the UI: idle, drafting, saving, saved, error.
- [x] Show clear inline messaging for validation errors and save failures.
- [x] Add an affordance to edit an existing saved log.

### Done when

- [x] The album page no longer presents rating as an instant-save utility.
- [x] The CTA hierarchy matches the intended product language: log first, review text optional.
- [x] The saved state is visually distinct from the drafting state.

## Phase 4: Tracklist as favorite-song picker

- [x] Make the album tracklist selectable as the favorite-song input surface.
- [x] Allow users to set a favorite song from the tracklist with one click/tap.
- [x] Allow users to clear their favorite song selection.
- [x] Show `Your pick` on the selected track in the logged-in state.
- [x] Keep the tracklist usable even when the user chooses not to select a favorite song.

### Done when

- [x] Favorite song selection happens from the tracklist, not a hidden form control.
- [x] Clearing a favorite song is possible without deleting the whole log.
- [x] The UI stays understandable when no favorite song is selected.

## Phase 5: Community summary

- [x] Add a server helper for album-level community summary data.
- [x] Include average rating and review count in the summary payload.
- [x] Add a rating histogram for 0.5-star increments.
- [x] Add favorite-song counts by track.
- [x] Compute a standout track for the album when enough favorite-song data exists.
- [x] Load the summary on the album page without deriving it from the client reviews feed.
- [x] Render an explicit unavailable state when the aggregate query fails.

### Done when

- [x] The hero/community modules consume a dedicated summary object.
- [x] Community favorite-song data does not depend on loading all reviews in the browser.
- [x] The page can render gracefully if some summary fields are empty.

## Phase 6: Album page layout update

- [ ] Update `src/app/album/[slug]/page.tsx` so the top of the page emphasizes contribution.
- [ ] Keep album metadata visible, but move the album log card above the fold.
- [ ] Add a community snapshot section below the hero.
- [ ] Keep the tracklist visible and interactive.
- [ ] Add a reviews feed section below the tracklist/community modules.

### Done when

- [ ] The page reads as an opinion/logging surface, not just a metadata page.
- [ ] Rating, favorite-song selection, and community proof are visible without hunting.
- [ ] The page remains usable on mobile and desktop.

## Phase 7: Reviews feed

- [ ] Add a reviews feed component, likely `src/components/review/ReviewsFeed.tsx`.
- [ ] Render rating, review text excerpt, and favorite-song badge for each review.
- [ ] Handle the empty state when an album has no written reviews yet.
- [ ] Ensure the feed works with reviews that have no `favorite_track_id`.

### Done when

- [ ] Reviews reinforce the album-page social loop.
- [ ] Favorite-song badges are visible when present and absent gracefully when not.
- [ ] Empty states do not make the page feel broken.

## Phase 8: Cleanup and consolidation

- [ ] Remove or retire `src/hooks/useQuickReview.ts` once the unified flow is live.
- [ ] Remove or retire `src/hooks/useQuickReviewMutation.ts` once the unified flow is live.
- [x] Rename or refactor `src/components/review/ReviewForm.tsx` if the file name no longer reflects its responsibility.
- [x] Update any stale imports, comments, and references that still describe the old quick-review behavior.
- [ ] Audit README diagrams and descriptions that mention outdated review submission behavior.

### Done when

- [ ] There is no parallel quick-review path left in production code.
- [ ] Naming matches the actual album log behavior.
- [ ] The docs no longer describe the old instant-save star flow.

## Phase 9: Tests

- [x] Expand `src/hooks/useReviewForm.test.ts` to cover draft restore.
- [ ] Expand `src/hooks/useReviewForm.test.ts` to cover failed submit preserving draft state.
- [ ] Expand `src/hooks/useReviewForm.test.ts` to cover clearing favorite song.
- [ ] Expand `src/hooks/reviewFormReducer.test.ts` for the new reducer actions and state transitions.
- [ ] Add one component/integration test for the full album log flow.
- [ ] Add tests for server-side `favorite_track_id` validation.
- [x] Add a test covering edit mode hydration from an existing review.

### Done when

- [ ] The new UX flow has hook coverage and one integration-style UI test.
- [ ] Invalid favorite-song writes are covered by tests.
- [ ] Draft persistence and error recovery are covered by tests.

## Phase 10: Final verification

- [ ] Verify create flow: rating only.
- [ ] Verify create flow: rating + favorite song.
- [ ] Verify create flow: rating + favorite song + review text.
- [ ] Verify edit flow for an existing review.
- [ ] Verify draft restore after navigation/reload.
- [ ] Verify failed submit keeps the draft intact.
- [ ] Verify community summary renders for albums with and without favorite-song data.
- [ ] Run the smallest relevant automated test suite first, then broader validation if needed.

### Done when

- [ ] The album page supports the full logging ritual end-to-end.
- [ ] The failure modes called out in planning are handled visibly.
- [ ] The old quick-review behavior is fully replaced.

## Not In Scope

- [ ] Instrumentation and funnel analytics.
- [ ] Feature flags for rollout.
- [ ] Track normalization into its own relational table.
- [ ] Comments, likes, or broader social graph features.
