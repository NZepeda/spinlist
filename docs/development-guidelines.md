# Development Guidelines

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production server |
| `pnpm test` | Run tests in watch mode with Vitest |
| `pnpm test:ci` | Run tests once for CI-style verification |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint and apply fixable changes |

## Code conventions

### State management

- Prefer `useReducer` when a hook or component manages three or more pieces of state.
- Use `Boolean(...)` instead of the double negation operator.
- Use block-form conditionals with braces.

### Types

- Do not use `any` in TypeScript.
- Keep types organized by layer in `domain/`, `dto/`, `db/`, and `api/`.
- Treat `src/server/database/generated/` as generated output and avoid manual edits there.

### Components and hooks

- Keep components focused on view logic.
- Put business logic in hooks when it is stateful, reused, or makes components harder to read.
- Avoid direct Supabase or Spotify calls inside UI components.
- Prefer placing feature-owned components and hooks under `src/features/<feature>/`.
- Keep reusable route-independent UI in `src/shared/ui/`.

### Documentation expectations

- Add JSDoc comments to functions and components.
- For shadcn/ui components, describe the use case rather than the structure.
- Add inline comments where the reasoning would otherwise be hard to infer from the code alone.
