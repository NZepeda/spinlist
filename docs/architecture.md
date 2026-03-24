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

- `src/app/` - Next.js App Router routes, layouts, metadata, and API route handlers
- `src/features/` - Feature-owned UI, hooks, server actions, loaders, and tests
- `src/shared/` - Generic UI primitives, utilities, providers, and shared test helpers
- `src/server/` - Server-only adapters for Supabase, Spotify, slug resolution, logging, and database mapping
- `supabase/schemas/` - Declarative schema files used as the database source of truth

## Ownership Rules

- `src/app/` must stay thin and route-focused. Reusable modules do not belong under route folders.
- `src/shared/ui/` contains generic presentational primitives and reusable controls.
- `src/features/*` owns business logic for its product area, including hooks, actions, loaders, and route-facing components.
- `src/server/` contains provider adapters, generated database types, row aliases, slug helpers, and server-only mappers.
- Review writes flow through the authenticated API boundary instead of writing directly to Supabase from the browser.

## Key Patterns

### Feature-first boundaries

Each feature should be understandable from one folder.
Search, auth, navigation, albums, and reviews own their UI, state, and tests within `src/features/`.

### Separation of concerns

Route files compose feature entrypoints instead of reaching into unrelated folders.
Shared modules stay generic, while feature hooks own stateful workflows and side effects.

Forms with three or more state fields use `useReducer` instead of multiple `useState` calls.

### Layered types

Type boundaries still isolate external APIs, internal contracts, raw database rows, and business models:

1. `src/server/spotify/types.ts` for external Spotify payloads.
2. `src/shared/types/dto/` for app-facing contracts.
3. `src/server/database/` for generated database and row-level types.
4. `src/shared/types/domain/` for business models used by the application.

This keeps provider-specific data models from leaking into product code and makes boundary changes easier to contain.

### Mapper layer

Every boundary crossing goes through pure mappers in `src/server/database/mappers/` or `src/server/spotify/`.
These functions normalize casing, parse JSON-backed fields defensively, and keep transformation logic out of route files and client components.

## Data Flow

### Album page load

1. `src/app/album/[slug]/page.tsx` composes feature loaders for album data and review data.
2. `src/features/albums/server/getAlbum.ts` resolves the album domain model on the server.
3. `src/features/reviews/server/` provides the community summary and review feed.
4. Client review UI lives in `src/features/reviews/components/` and `src/features/reviews/hooks/`.

### Review submission

1. The review form updates local reducer state while the user edits fields.
2. Submission and deletion call `src/features/reviews/commands/`.
3. `src/app/api/reviews/route.ts` validates and persists writes through the authenticated server boundary.
4. The relevant user review query invalidates so the UI reloads fresh state.
