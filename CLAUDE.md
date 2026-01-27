- For every added shadcn/ui component added, add the appropriate jsdoc comment describing the component and its use case.

- If a component has more 3 pieces of state, go for a useReducer instead of useState.

- Always attempt to separate the view logic from the business logic. Use hooks for business logic.

- Check package.json to determine what versions of packages/libraries are being used.

- When attempting to use any "supabase" command, run it with "pnpx supabase"

- Never use the double negation operator (!!). Always go for Boolean() instead.

- Never inline if statement like if(condition) return something. Always use the block form with {}.

- Always split functions into their own files.

- Always prefer declarative code over imperative code.

- If clarification is needed about the requirements, ask before proceeding.

- NEVER use `any` type in TypeScript. Always define proper types or interfaces.

## Supabase Database Workflow

This project uses declarative schema files (`supabase/schemas/*.sql`) as the source of truth.

### Making Schema Changes

1. **Always update declarative schema files first** - Edit the appropriate file in `supabase/schemas/` (or create a new one if adding a table).

2. **Update `config.toml` if adding new schema files** - Add the new file path to `schema_paths` in the correct order (tables before foreign key dependents).

3. **Generate a migration from the diff**:
   ```bash
   pnpx supabase db diff -f descriptive_migration_name
   ```

4. **Verify the migration locally**:
   ```bash
   pnpx supabase db reset
   ```

5. **Push to remote**:
   ```bash
   pnpx supabase db push --dry-run  # Preview first
   pnpx supabase db push            # Apply
   ```

### Rules

- NEVER make schema changes directly in Studio UI without immediately running `db diff` to capture them.
- NEVER manually edit migration files after they've been pushed to remote.
- ALWAYS run `pnpx supabase db diff` before committing to ensure no uncommitted schema changes exist.
- If `db diff` outputs anything unexpected, investigate before proceeding.
