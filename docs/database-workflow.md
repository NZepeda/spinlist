# Database Workflow

The declarative files in `supabase/schemas/` are the source of truth for the database schema.

## Making schema changes

1. Update the relevant file in `supabase/schemas/`.
2. If you add a new schema file, register it in `supabase/config.toml` under `schema_paths` in dependency order.
3. Generate a migration from the declarative diff:

```bash
pnpx supabase db diff -f descriptive_migration_name
```

4. Verify the schema locally:

```bash
pnpx supabase db reset
```

5. Preview the remote push:

```bash
pnpx supabase db push --dry-run
```

6. Apply the remote push:

```bash
pnpx supabase db push
```

## Guardrails

- Always run Supabase commands through `pnpx supabase`.
- Avoid making schema changes directly in Supabase Studio unless you immediately capture them in the declarative schema and generated migration.
- Do not manually edit migration files after they have been pushed to the remote project.
- Run `pnpx supabase db diff` before committing when schema work is involved so unexpected drift is caught early.
