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
