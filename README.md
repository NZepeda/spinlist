# Spinlist

**Letterboxd for albums.** Spinlist is a music discovery and social cataloging app where users can search for albums, read community stats, rate records with a star system, and write reviews.

> Live app: _coming soon_

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | ^5 |
| Runtime | React | 19.1.0 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui (Radix UI) | shadcn ^3.2.1 |
| Backend & Auth | Supabase (PostgreSQL + RLS) | supabase-js ^2.75.0 |
| Server State | TanStack Query | ^5.86.0 |
| Music Data | Spotify Web API | — |
| Testing | Vitest + Testing Library | vitest ^4.0.18 |

---

## Project Structure

- `src/app/` — Next.js App Router pages and API route handlers
- `src/components/` — Pure UI components; no async logic or direct API calls
- `src/hooks/` — All business logic: async state, mutations, and side effects
- `src/lib/types/` — Layered type system: `domain/`, `dto/`, `db/`, `api/`, `generated/`
- `src/lib/mappers/` — Pure data transformation functions (DB rows → domain, Spotify → DTO)
- `src/lib/mutations/` — Server-side write operations (`submitReview`, `deleteReview`)
- `supabase/schemas/` — Declarative schema files; source of truth for the database

---

## Architecture: Key Patterns

### A. Separation of Concerns — Hooks for Business Logic

**Components are pure UI.** They receive props and render. All async state, side effects, API calls, and mutations live in hooks.

```
┌──────────────────────────────────────────────────┐
│  Component (QuickReview.tsx)                     │
│  • Renders stars                                 │
│  • Calls onRatingChanged from hook               │
└────────────────┬─────────────────────────────────┘
                 │ uses
┌────────────────▼─────────────────────────────────┐
│  Hook (useQuickReview.ts)                        │
│  • Manages rating state                          │
│  • Calls submitReview mutation via TanStack      │
│  • Reads existing review from useUserAlbumReview │
└──────────────────────────────────────────────────┘
```

Forms with 3 or more state fields use `useReducer` instead of multiple `useState` calls. See `reviewFormReducer.ts`, `loginReducer.ts`, `signUpReducer.ts`.

---

### B. Layered Type System

Types are organized in four layers, each with a clear responsibility. No layer's types leak into a higher layer.

```
 ┌─────────────────────────────────────────────────────┐
 │  api/           Spotify API response shapes         │
 │  (SpotifyAlbumFull, SpotifyArtist, …)               │
 └───────────────────────┬─────────────────────────────┘
                         │  mappers/spotify/
 ┌─────────────────────────────────────────────────────┐
 │  dto/           API contracts for this app          │
 │  (AlbumSummaryDTO, SearchResponseDTO, …)            │
 └───────────────────────┬─────────────────────────────┘
                         │  mappers/db/
 ┌─────────────────────────────────────────────────────┐
 │  db/            Raw Supabase row types              │
 │  (AlbumRow, ReviewRow, ProfileRow, …)               │
 └───────────────────────┬─────────────────────────────┘
                         │  mappers/db/
 ┌─────────────────────────────────────────────────────┐
 │  domain/        Core business models                │
 │  (Album, Artist, Profile, Review, …)                │
 └─────────────────────────────────────────────────────┘
```

**Why**: Spotify's image/track shapes are complex nested objects. Mapping them at the boundary means components never know or care about Spotify's API design. Swapping the music data source would only require updating mappers.

---

### C. Mapper Layer

Every boundary crossing goes through a pure mapper function in `lib/mappers/`. Mappers:

- Handle defensive JSON parsing for JSONB columns (`images`, `tracks` in albums table)
- Convert snake_case DB fields to camelCase domain models
- Filter null/undefined values with `flatMap` rather than unsafe type assertions
- Keep all transformation logic out of components and hooks

```
Spotify API response
        │
        ▼ mapSpotifyAlbumToAlbumSummaryDTO()
  AlbumSummaryDTO  (used in search results)

Supabase DB row
        │
        ▼ mapAlbumRowToAlbum()
  Album  (domain model used by components)
```

---

## Data Flow

### 1. Album Page Load

```
Request: /album/[slug]
        │
        ▼ app/album/[slug]/page.tsx  (Server Component)
  resolveAlbumSlug(slug)             → looks up Spotify ID from DB
        │
        ▼ getAlbum(spotifyId)        → DB first, falls back to Spotify API
  AlbumRow
        │
        ▼ mapAlbumRowToAlbum()       → mapper transforms DB row to domain model
  Album (domain)
        │
        ▼ passed as props to client components
  <QuickReview albumId={album.id} />
        │
        ▼ useQuickReview({ albumId }) → hook fetches existing review, manages mutation
  Renders star rating with current user's rating
```

### 2. Review Submission

```
User changes star rating in <StarRating />
        │
        ▼ onRatingChanged(newRating)  → prop from useQuickReview
  setRating(newRating)               → local state update (optimistic UI)
        │
        ▼ useEffect([rating])
  reviewMutation.mutate(rating)      → TanStack Query mutation
        │
        ▼ submitReview({ userId, albumId, rating, existingReviewId })
  supabase.from("reviews").upsert()  → Supabase browser client
        │
        ▼ onSuccess
  TanStack Query invalidates affected query keys → UI refetches fresh data
```

---

## Local Development Setup

### Prerequisites

- Node.js v20 or later
- pnpm (`npm install -g pnpm`)
- Docker Desktop (required for local Supabase)
- A [Spotify Developer App](https://developer.spotify.com/dashboard)

### Steps

**1. Clone and install**

```bash
git clone <repository-url>
cd spinlist
pnpm install
```

**2. Start local Supabase**

```bash
pnpx supabase start
```

This starts a local Postgres instance with the full Supabase stack. The CLI will print your local `API URL` and `anon key` when it's ready.

**3. Create `.env.local`**

```bash
# Supabase — copy values from `pnpx supabase start` output
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>

# Spotify — from https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>

# Optional — defaults to https://thespinlist.com in production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**4. Apply the schema**

```bash
pnpx supabase db reset
```

**5. Start the dev server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Workflow

The `supabase/schemas/` directory is the **source of truth** for the database schema. Never make schema changes directly in the Supabase Studio UI without capturing them.

### Making Schema Changes

**1. Edit the declarative schema file**

Update the relevant file in `supabase/schemas/` (or create a new one for a new table). Update `supabase/config.toml` `schema_paths` if adding a new file.

**2. Generate a migration from the diff**

```bash
pnpx supabase db diff -f descriptive_migration_name
```

**3. Verify locally**

```bash
pnpx supabase db reset
```

**4. Preview and push to remote**

```bash
pnpx supabase db push --dry-run  # preview what will run
pnpx supabase db push            # apply to remote
```

> **Warning**: Never manually edit migration files after they've been pushed to remote.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server with Turbopack (Node debugger enabled) |
| `pnpm build` | Build for production with Turbopack |
| `pnpm start` | Start the production server |
| `pnpm test` | Run tests in watch mode with Vitest |
| `pnpm test:ci` | Run tests once (for CI pipelines) |
| `pnpm lint` | Lint with ESLint |
| `pnpm lint:fix` | Lint and auto-fix fixable issues |

---

## Developer Guidelines

These conventions are enforced project-wide. Read them before submitting code.

### State Management

- Use `useReducer` when a hook or component has **3 or more pieces of state**
- Never use the double negation operator `!!` — use `Boolean()` instead
- All `if` statements must use block form: `if (condition) { return x; }` — never inline

### Types

- Never use `any` in TypeScript — define proper interfaces or types
- Organize types by layer: `domain/`, `dto/`, `db/`, `api/`
- Generated types in `lib/types/generated/` are auto-generated — do not edit manually

### Components

- Add a JSDoc comment to every shadcn/ui component describing its use case
- Components are **pure UI only** — no direct Supabase or Spotify calls inside components
- Prefer declarative code over imperative code

### Functions & Hooks

- Split every function into its own file
- Business logic belongs in hooks, not components
- Use hooks to encapsulate async state, mutations, and side effects

### Supabase

- Always use `pnpx supabase` (never a globally installed `supabase` CLI)
- Schema files in `supabase/schemas/` are the source of truth — always edit there first
- Run `pnpx supabase db diff` before committing to catch uncommitted schema changes
