# Spinlist

Spinlist is a "Letterboxd for Albums" — a web application that combines music discovery with social interaction. Users can search for albums, view detailed metadata, and engage with the community by rating and reviewing their favorite records.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Music Data**: [Spotify API](https://developer.spotify.com/documentation/web-api)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

Follow these instructions to set up your local development environment.

### Prerequisites

- Node.js (v20 or later)
- pnpm
- A Supabase project
- A Spotify Developer App

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd spinlist
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory and add the following keys:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

   # Spotify API Configuration
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Scripts

- `pnpm dev`: Runs the development server with Turbopack.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
