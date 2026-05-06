# Database Setup

This project uses **declarative schemas** for database management. Instead of writing manual migrations, we maintain a schema file that represents the desired database state, and Supabase generates migrations automatically.

## Configuration

The database schema is split into atomic files for better organization. These files are configured in `config.toml`:

```toml
[db.migrations]
schema_paths = [
  "./schemas/extensions.sql",   # Database extensions
  "./schemas/functions.sql",    # All functions
  "./schemas/users.sql",        # Users table (parent)
  "./schemas/artists.sql",      # Artists table (parent)
  "./schemas/albums.sql",       # Albums table (parent)
  "./schemas/album_artists.sql",# Album credits (child, depends on artists & albums)
  "./schemas/reviews.sql",      # Reviews table (child, depends on users & albums)
  "./schemas/review_revisions.sql", # Review history (child, depends on reviews)
  "./schemas/policies.sql",     # All RLS policies
  "./schemas/triggers.sql",     # All triggers
  "./schemas/grants.sql",       # All permissions
]
```

**Order matters:** Extensions must be first, functions before triggers, and parent tables before child tables (due to foreign key dependencies).

## Making Schema Changes

### 1. Edit the Appropriate Schema File

Modify the relevant schema file in `supabase/schemas/` to reflect your desired database state.

Example - adding a column to albums:
```sql
-- Edit supabase/schemas/albums.sql
CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spotify_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "genre" "text",  -- ← Add new columns directly
    -- ... rest of definition
);
```

Example - modifying a function:
```sql
-- Edit supabase/schemas/functions.sql
-- Just update the function body in place
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() ...
```

### 2. Generate Migration

```bash
pnpm exec supabase db diff -f descriptive_name
```

This compares your schema file against the current database and generates a migration in `supabase/migrations/`.

### 3. Apply Changes

```bash
# Apply locally
pnpm exec supabase db reset

# Push to remote
pnpm exec supabase db push
```

## When to Use Manual Migrations

The diff tool can't handle everything. Use `pnpm exec supabase migration new name` for:
- Data operations (INSERT, UPDATE, DELETE)
- RLS policy changes
- Materialized views

After manual migrations, regenerate all schema files:
```bash
# Dump the current schema
pnpm exec supabase db dump --local -f supabase/schemas/temp.sql

# Then manually split it back into the organized files
```

## Quick Reference

```bash
# Start local Supabase
pnpm exec supabase start

# View local dashboard
http://127.0.0.1:54323

# Generate migration from schema changes
pnpm exec supabase db diff -f migration_name

# Apply all migrations locally
pnpm exec supabase db reset

# Push to remote
pnpm exec supabase db push
```

## Learn More

- [Declarative Schemas Guide](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Docs](https://supabase.com/docs/guides/local-development)
