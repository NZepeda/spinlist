## Spinlist - Project Summary

**Spinlist** is a "Letterboxd for Albums" — a music discovery and social platform where users can search for albums, view metadata, and rate/review records.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Backend & Auth | Supabase |
| Music Data | Spotify API |
| State Management | TanStack Query v5 |

### Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (Spotify proxy)
│   │   ├── album/[id]/     # Album detail endpoint
│   │   └── search/         # Album search endpoint
│   ├── album/[id]/         # Album detail page
│   ├── login/              # Login page
│   ├── signup/             # Sign up page
│   └── page.tsx            # Home page
├── components/
│   ├── ui-core/            # shadcn/ui components (button, input, dialog, etc.)
│   ├── contexts/           # React Query provider
│   ├── Navbar.tsx          # Navigation with mobile/desktop variants
│   └── SearchBar.tsx       # Album search component
├── hooks/                  # Custom hooks (useAuth, useLogin, useSignUp, useDebounce)
├── lib/
│   ├── supabase/           # Supabase client (server/client) & session handling
│   ├── types/              # TypeScript types for album/search
│   └── getSpotifyToken.ts  # Spotify API authentication
└── types/                  # Database types

supabase/
├── migrations/             # Database migrations
└── schemas/                # Database schemas
```

### Database Schema

The application uses Supabase (PostgreSQL) with three main tables, all with Row Level Security (RLS) enabled:

#### profiles
Stores user profile information, linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | References `auth.users.id` |
| username | text (unique) | User's display name |
| avatar_url | text | Profile picture URL |
| created_at | timestamptz | Account creation timestamp |
| updated_at | timestamptz | Last profile update |

#### albums
Caches album metadata from Spotify to support ratings and reviews.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Internal album ID |
| spotify_id | text (unique) | Spotify album identifier |
| title | text | Album title |
| artist | text | Artist name |
| release_date | date | Album release date |
| cover_url | text | Album cover image URL |
| avg_rating | numeric(0-5) | Computed average rating |
| review_count | integer | Total number of reviews |
| created_at | timestamptz | When album was added |
| last_synced_at | timestamptz | Last Spotify sync |

#### reviews
Stores user reviews and ratings for albums.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Review ID |
| user_id | uuid (FK) | References `profiles.id` |
| album_id | uuid (FK) | References `albums.id` |
| rating | numeric(1-5) | User's rating |
| review_text | text | Optional review content |
| created_at | timestamptz | Review creation timestamp |
| updated_at | timestamptz | Last review update |

#### Entity Relationships

```
profiles (1) ──────< reviews >────── (1) albums
   │                                      │
   └── id ◄─── user_id    album_id ───► id
```

### Key Patterns

- **Separation of concerns**: Business logic in custom hooks (`useAuth`, `useLogin`, `useSignUp`), view logic in components
- **API proxy pattern**: Next.js API routes proxy Spotify API calls to protect credentials
- **SSR-ready auth**: Supabase client configured for both server and client components
- **Type safety**: Generated database types from Supabase schema
