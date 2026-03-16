# Architecture

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | ^5 |
| Runtime | React | 19.1.0 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui (Radix UI) | shadcn ^3.2.1 |
| Backend and Auth | Supabase (PostgreSQL + RLS) | supabase-js ^2.75.0 |
| Server State | TanStack Query | ^5.86.0 |
| Music Data | Spotify Web API | - |
| Testing | Vitest + Testing Library | vitest ^4.0.18 |

## Project Structure

- `src/app/` - Next.js App Router pages and API route handlers
- `src/components/` - Pure UI components with no direct async data access
- `src/hooks/` - Business logic, async state, mutations, and side effects
- `src/lib/types/` - Layered type system across `domain/`, `dto/`, `db/`, `api/`, and `generated/`
- `src/lib/mappers/` - Pure transformations between external, persistence, and domain shapes
- `src/lib/mutations/` - Server-side write operations such as review submission
- `supabase/schemas/` - Declarative schema files used as the database source of truth

## Key Patterns

### Separation of concerns

Components stay focused on rendering and user interaction surfaces.
Hooks own async state, side effects, validation, and persistence workflows.

Forms with three or more state fields use `useReducer` instead of multiple `useState` calls.

### Layered types

Type boundaries isolate external APIs, internal contracts, raw database rows, and business models:

1. `api/` for external service response shapes such as Spotify payloads.
2. `dto/` for app-facing contracts.
3. `db/` for raw Supabase row types.
4. `domain/` for business models used by the application.

This keeps provider-specific data models from leaking into product code and makes boundary changes easier to contain.

### Mapper layer

Every boundary crossing goes through pure mappers in `src/lib/mappers/`.
These functions normalize casing, parse JSON-backed fields defensively, and keep transformation logic out of components and hooks.

## Data Flow

### Album page load

1. `src/app/album/[slug]/page.tsx` loads the album domain model on the server.
2. The page resolves community summary and review feed data.
3. Client experiences consume user-specific review state through hooks such as `useUserAlbumReview` and `useReviewForm`.

### Review submission

1. The review form updates local reducer state while the user edits fields.
2. Submission calls the review mutation layer with the explicit payload.
3. The API route validates and persists the review.
4. The relevant user review query invalidates so the UI reloads fresh state.
