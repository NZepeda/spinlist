# Database Setup

This project uses **declarative schemas** for database management. Instead of writing manual migrations, we maintain a schema file that represents the desired database state, and Supabase generates migrations automatically.

## Configuration

The source of truth is `supabase/schemas/schema.sql`, configured in `config.toml`:

```toml
[db.migrations]
schema_paths = ["./schemas/schema.sql"]
```

## Making Schema Changes

### 1. Edit the Schema File

Modify `supabase/schemas/schema.sql` to reflect your desired database state.

Example - adding a column:
```sql
CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "spotify_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "genre" "text",  -- ← Add new columns directly
    -- ... rest of definition
);
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

After manual migrations, update the schema file:
```bash
pnpx supabase db dump --local -f supabase/schemas/schema.sql
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
