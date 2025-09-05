# 📄 PRD: Music Rating & Discovery Website (Letterboxd for Albums)

## 1. Overview

A web application where users can **search for albums (via Spotify API)**, view album pages with **tracklist & metadata**, and engage with the community by **rating and reviewing albums**. The product combines **music discovery** and **social interaction** for fans.

- **Framework:** Next.js (App Router, Server Components where possible)
- **Styling:** TailwindCSS
- **Database/Auth:** Supabase (Postgres + Auth + Storage)
- **Music Data Source:** Spotify API

---

## 2. Goals

- Allow users to **search albums** and **import metadata from Spotify**.
- Provide **album detail pages** with tracklist, metadata, and aggregated user ratings.
- Enable **user reviews and ratings** (similar to Letterboxd’s film reviews).
- Build a **social music discovery loop** via user-generated reviews.

---

## 3. User Stories

### Core

1. As a user, I can **search for an album by title/artist** so I can find music quickly.
2. As a user, I can **view an album page** with album art, tracklist, artist info, and metadata.
3. As a user, I can **rate an album** (1–5 stars or 1–10 scale TBD).
4. As a user, I can **write a review** for an album and see reviews from other users.
5. As a user, I can **sign up and log in** using email or OAuth (Spotify/Google).

### Extended (Phase 2+)

6. As a user, I can **follow other users** to see their activity.
7. As a user, I can **see trending or popular albums** based on community reviews.
8. As a user, I can **save albums to custom lists** (e.g., “2025 favorites”).
9. As a user, I can **comment on reviews**.

---

## 4. Functional Requirements

### 4.1 Search

- Input box with **debounced query** → hits **Spotify API Search** endpoint.
- Display results with **album cover, title, artist, release year**.
- Clicking a result → navigates to album detail page.

### 4.2 Album Page

- Fetch album metadata from **Spotify API** (tracklist, release date, cover art).
- If album doesn’t exist in local DB → insert entry into Supabase (`albums` table).
- Show:
  - Cover art
  - Title + artist
  - Release year
  - Tracklist
  - Average rating
  - User reviews

### 4.3 Reviews & Ratings

- Authenticated users can **submit rating + review**.
- Reviews stored in Supabase (`reviews` table).
- Aggregate rating recalculated per album.
- Reviews displayed chronologically with pagination.

### 4.4 Authentication

- Supabase Auth with **email + password**.
- OAuth with **Spotify** and **Google** (stretch goal).
- Users stored in `users` table.

---

## 5. Data Model (Supabase)

### Tables

**`users`**

- `id` (UUID, PK)
- `username` (string, unique)
- `avatar_url` (string)
- `created_at` (timestamp)

**`albums`**

- `id` (UUID, PK)
- `spotify_id` (string, unique)
- `title` (string)
- `artist` (string)
- `release_date` (date)
- `cover_url` (string)
- `created_at` (timestamp)

**`reviews`**

- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `album_id` (FK → albums.id)
- `rating` (int, 1–5)
- `review_text` (text)
- `created_at` (timestamp)

---

## 6. Architecture

### Frontend

- **Next.js 15**
  - `app/` router with **SSR for album pages**.
  - Client components for interactive features (review submission, rating UI).
- **TailwindCSS** for utility-first styling.

### Backend / DB

- **Supabase** handles:
  - Postgres DB
  - Auth & sessions
  - Row-level security (users can edit/delete their own reviews).

### Integrations

- **Spotify API** for album search + metadata.
  - Store minimal metadata locally in `albums` table.
  - Refresh if data is stale (>30 days old).

---

## 7. API Endpoints (Next.js Routes)

**Search**  
`GET /api/search?query=term` → proxies Spotify search results.

**Album**  
`GET /api/albums/[spotify_id]` → fetch from DB or Spotify, cache in Supabase.

**Reviews**  
`POST /api/reviews` → create review (auth required).  
`GET /api/albums/[spotify_id]/reviews` → list reviews.

---

## 8. UX / UI

- **Homepage:** Search bar + trending albums section.
- **Search Results:** Grid of album covers.
- **Album Page:**
  - Header with cover art, album info.
  - Tracklist section.
  - Ratings summary.
  - Reviews feed with “write review” form.
- **Profile Page (Phase 2):** User’s reviews & favorite albums.

---

## 9. Non-Functional Requirements

- **Performance:** Search requests < 500ms latency.
- **Scalability:** DB designed for millions of reviews.
- **Security:**
  - Supabase Row-Level Security (users only edit their own reviews).
  - OAuth token handling for Spotify API.
- **Accessibility:** WCAG AA compliance.
- **Responsive:** Mobile-first, scales to desktop.

---

## 10. Milestones

### Phase 1 (MVP)

- Supabase setup (auth, DB schema).
- Spotify API search integration.
- Album detail page (SSR).
- Review + rating system.
- Basic Tailwind styling.

### Phase 2

- User profiles.
- Following system.
- Trending albums feed.
- Custom album lists.

### Phase 3

- Comments on reviews.
- Social features (likes, shares).
- Recommendation engine (collaborative filtering).
