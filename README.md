# Spinlist

Spinlist is a music discovery and social cataloging app for albums.
Users can search for records, read community stats, rate albums, and write reviews.

## Development Setup

### Prerequisites

- Node.js 20 or later
- `pnpm`
- Docker Desktop
- A [Spotify Developer App](https://developer.spotify.com/dashboard)

### Install dependencies

```bash
git clone <repository-url>
cd spinlist
pnpm install
```

### Start local services

```bash
pnpm exec supabase start
```

Create `.env.local` with the local Supabase values from the CLI output and your Spotify app credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Apply the local schema and start the app:

```bash
pnpm exec supabase db reset
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Additional Docs

- [Technical docs](./docs/README.md)
