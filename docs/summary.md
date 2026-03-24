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
├── app/                    # Next.js App Router routes and API handlers
├── features/               # Feature-owned modules
│   ├── albums/
│   ├── auth/
│   ├── navigation/
│   ├── reviews/
│   └── search/
├── server/                 # Server-only adapters and database mapping
│   ├── database/
│   ├── spotify/
│   ├── supabase/
│   └── slugs/
└── shared/                 # Generic UI, utilities, providers, and test helpers
    ├── providers/
    ├── test/
    ├── types/
    ├── ui/
    └── utils/

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
| images | jsonb | Normalized album artwork payload |
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

- **Feature-first ownership**: Search, auth, navigation, albums, and reviews each own their UI and behavior in one place
- **Thin routes**: Next.js route files compose feature and server modules instead of holding reusable logic
- **Server boundary adapters**: Supabase, Spotify, slug resolution, and row mappers live under `src/server/`
- **Type safety**: Generated database types stay isolated under `src/server/database/generated/`
