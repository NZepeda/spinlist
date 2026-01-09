# Database Setup

This project uses **declarative schemas** for database management. Instead of writing manual migrations, we maintain a schema file that represents the desired database state, and Supabase generates migrations automatically.

## Configuration

The database schema is split into atomic files for better organization. These files are configured in `config.toml`:

```toml
[db.migrations]
schema_paths = [
  "./schemas/extensions.sql",   # Database extensions
  "./schemas/functions.sql",    # All functions
  "./schemas/profiles.sql",     # Profiles table (parent)
  "./schemas/albums.sql",       # Albums table (parent)
  "./schemas/reviews.sql",      # Reviews table (child, depends on profiles & albums)
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
pnpx supabase db diff -f descriptive_name
```

This compares your schema file against the current database and generates a migration in `supabase/migrations/`.

### 3. Apply Changes

```bash
# Apply locally
pnpx supabase db reset

# Push to remote
pnpx supabase db push
```

## When to Use Manual Migrations

The diff tool can't handle everything. Use `pnpx supabase migration new name` for:
- Data operations (INSERT, UPDATE, DELETE)
- RLS policy changes
- Materialized views

After manual migrations, regenerate all schema files:
```bash
# Dump the current schema
pnpx supabase db dump --local -f supabase/schemas/temp.sql

# Then manually split it back into the organized files, or just run:
pnpx supabase db dump --local -f supabase/schemas/schema.sql
# And split it yourself
```

## Quick Reference

```bash
# Start local Supabase
pnpx supabase start

# View local dashboard
http://127.0.0.1:54323

# Generate migration from schema changes
pnpx supabase db diff -f migration_name

# Apply all migrations locally
pnpx supabase db reset

# Push to remote
pnpx supabase db push
```

## Learn More

- [Declarative Schemas Guide](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Docs](https://supabase.com/docs/guides/local-development)
