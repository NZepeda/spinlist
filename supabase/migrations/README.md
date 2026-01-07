# Database Migrations

## Apply Migration

### Option 1: Using Supabase CLI (Recommended)

If you haven't initialized Supabase locally:
```bash
supabase init
supabase link --project-ref your-project-ref
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `20260106000000_create_initial_schema.sql`
4. Run the migration

## What This Migration Creates

### Tables
- **profiles** - User profiles (auto-created on signup)
- **albums** - Album metadata cached from Spotify
- **reviews** - User reviews and ratings

### Features
- ✅ Auto-updating `updated_at` timestamps
- ✅ Auto-recalculating `avg_rating` and `review_count` on albums
- ✅ Auto-creating user profiles when they sign up
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ One review per user per album constraint

## After Migration

Generate TypeScript types:
```bash
supabase gen types typescript --local > src/types/database.types.ts
```
