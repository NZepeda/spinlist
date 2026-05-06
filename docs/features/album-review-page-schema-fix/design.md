# Design Brief: Album Review Page Schema Fix

## Primary flow

The listener opens an album page and sees the existing album hero, rating controls, and recent written reviews.
If the listener is signed in and has an active profile, the page loads their saved review state for that album and lets them rate the album or save optional review details.
All visible behavior stays the same, but the underlying review data path uses album-based identifiers consistently so the page no longer fails when reading or writing review data.

## Screens and surfaces

- `src/app/album/[slug]/page.tsx` remains the entry point that loads the album and review feed.
- `src/features/reviews/components/AlbumPageShell.tsx` keeps the current album page layout and section order.
- `src/features/reviews/components/AlbumReviewFlow.tsx` keeps the signed-in, signed-out, and pending-verification gating behavior.
- `src/features/reviews/components/AlbumPrimaryRatingCard.tsx` keeps the inline star rating and saved-details summary.
- `src/features/reviews/components/AlbumReviewComposer.tsx` keeps the dialog for favorite-song and written-review editing.
- `src/features/reviews/components/ReviewsFeed.tsx` keeps the recent written reviews list and empty state.

## States

- Default: The album page renders the album hero, current rating controls, and recent written reviews for the album.
- Loading: Signed-in review controls continue to show the existing skeleton while the current user's review is loading.
- Empty: The reviews section continues to show the existing empty-state copy when no written reviews exist for the album.
- Error: The page should no longer fail because of legacy review schema references.
- Success: A signed-in user can view an existing review, save a rating, and save review details for the current album without schema mismatch failures.

## Interactions

- Entry points: The listener reaches the flow by navigating to `/album/[slug]`.
- Primary actions: Signed-in users can set a star rating directly from the album rating card.
- Secondary actions: Signed-in users can open the review composer, pick a favorite song, write optional thoughts, and save.
- Validation and feedback: Existing inline validation, loading states, and save feedback remain unchanged except where release-group terminology must be renamed to album-specific language in the affected review API path.

## Edge cases

- Signed-out listeners still see the login prompt instead of review controls.
- Signed-in listeners with inactive profiles still see the pending-verification prompt.
- Users without an existing review still see an unrated state and can create a review for the current album.
- Users with an existing review still see their saved rating, favorite song, and review text for the current album.
- Albums with no written reviews still show the current empty feed state.
- Albums with tracks missing from a saved favorite-track reference continue to degrade gracefully without breaking the page.
- Save failures unrelated to the schema migration continue to surface through the existing inline error patterns.

## Accessibility notes

- Preserve the current dialog, button, form-label, and alert semantics already used by the album review flow.
- Preserve keyboard access for rating, composer open and close controls, and favorite-song selection.
- Preserve the current error-message exposure through `role="alert"` in the composer.

## Open design questions

- None.
