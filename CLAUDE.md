# Agent Instructions

Use this file as a high-priority repository guide for AI agents working in this codebase.

## Read Order

1. Read the user request carefully.
2. Read this file before making changes.
3. Check `package.json` before using project libraries or framework features.
4. For Next.js work, consult the local Next.js docs index in this file before relying on memory.
5. If requirements are ambiguous and the ambiguity affects behavior, ask for clarification before proceeding.

## Code Expectations

- Never use `any` in TypeScript. Define explicit types or interfaces.
- Never use the double negation operator `!!`. Use `Boolean(...)` instead.
- Always use block-form conditionals with braces.
- Document every function and component with JSDoc.
- When adding a shadcn/ui component, make its JSDoc describe the component's use case, not just its structure.
- Add inline code comments explaining the more complex logic.
- Think of the code from the perspectives of both a Principal Engineer and a new team member who is not familiar with the codebase. Write code that is clear and maintainable for both.
- All JSDoc comments should should be one sentence per line break.
- JSDoc comments/inline code comments should NEVER under any circumstance reference an implementation plane. There should be no reference of "phases", "plans" or "steps".
- JSDoc comments should be focused on ensuring that future readers understand what the function at a quick glance.
- JSDoc comments should be simple and easy to understand. Do not add fluff words or make the comments too technical. The goal is to make the code more accessible, not to make it more complex. A non-technical user should be able to read the comments and get a general understanding of what the code is doing without needing to understand the technical details.
- JSDoc comments should describe the enduring business or domain purpose of a function or component in plain language, without referencing technical mechanics or assuming a specific caller, screen, or usage context unless that context is intrinsic to the abstraction.
- You are to write code that is not just functional, but is also clean, maintainable, and well-documented. The code should be written in a way that is easy for other developers to understand and work with in the future. This means following best practices for code organization, naming conventions, and documentation. The goal is to create code that is not only effective but also a pleasure to work with for any developer who may need to interact with it down the line.

## Implementation Expectations

- Separate view logic from business logic whenever practical.
- Put client-side business logic into hooks when the logic is reused, stateful, or makes components harder to read.
- If a component needs more than 3 pieces of state, prefer `useReducer` over multiple `useState` calls.
- Keep single-use helpers close to the component or module that uses them.
- Extract shared logic into focused modules when it is reused in multiple places.
- Avoid mixing unrelated responsibilities in the same file.
- If following a TODO.md file, steps are complete, mark them as complete.

## Type System Expectations

- All exported types and interfaces must live in dedicated type files — never export types from hooks, server functions, route handlers, or utility modules.
- App-wide shared types belong in `src/shared/types/`. Re-export from `src/shared/types/index.ts` if the type is consumed outside its immediate feature.
- Feature-scoped types (state shapes, hook return types, reducer action unions) belong in `src/features/{feature}/types.ts`.
- HTTP request/response boundary types used by both a route handler and a client command belong in `src/shared/types/api/`.
- Do not define a type that already exists — derive from `@/server/database` row types or `@/shared/types` before writing a new interface.
- Private types that are only used within a single file (internal SQL result shapes, local helper argument objects) may stay inline and non-exported.
- Do not import types from hook files or server function files. If a component or hook needs a type defined elsewhere, that type should already live in a types file.

## Dependency Expectations

- Treat `package.json` as the source of truth for library and framework versions.
- Verify project versions before introducing APIs, syntax, or patterns that depend on version-specific behavior.

## Change Expectations

- Prefer minimal diffs that solve the requested problem without unrelated refactors.
- Follow established repository patterns unless the user explicitly asks for a new convention.
- If `AGENTS.md` and `CLAUDE.md` diverge, treat `AGENTS.md` as authoritative.

## Supabase Expectations

- Always run Supabase CLI commands through `pnpm exec supabase`.
- Define table shape in `src/lib/db/schema.ts` and treat it as the source of truth for the relational data model.
- Generate SQL migrations from the Drizzle schema with `pnpm exec drizzle-kit generate`.
- Keep `supabase/migrations` as the reviewed SQL artifact that Supabase applies.
- Use custom SQL migrations for database-native behavior that is not modeled cleanly in Drizzle, such as RLS policies, grants, triggers, functions, and views.
- Never maintain a second hand-written table schema in `supabase/schemas/*.sql`.
- Never manually edit migration files after they have been pushed to the remote project.
- Do not make table or column changes directly in Supabase Studio.

## Supabase Database Workflow

This project uses the Drizzle schema in `src/lib/db/schema.ts` as the source of truth for the relational data model.

1. Update `src/lib/db/schema.ts` first.
2. Generate a migration from the Drizzle schema:

   ```bash
   pnpm exec drizzle-kit generate
   ```

3. Review the generated SQL in `supabase/migrations` and add a custom migration when the change requires database-native SQL.
4. Verify the migration locally:

   ```bash
   pnpm exec supabase db reset
   ```

5. Preview the remote push:

   ```bash
   pnpm exec supabase db push --dry-run
   ```

6. Apply the remote push:

   ```bash
   pnpm exec supabase db push
   ```

## Next.js Expectations

- Do not rely on memory for Next.js behavior in this project.
- Search the local Next.js docs referenced below before making framework-level decisions.
- Prefer Server Components by default and only add `"use client"` when interactivity, client hooks, or browser-only APIs require it.
- If the docs index is missing, generate it with:

  ```bash
  npx @next/codemod agents-md --output CLAUDE.md
  ```

## Workflow Expectations

- After making any major change, explain the change and the reason for it.
- Break down complex changes into smaller, more manageable steps.
- After each step, explain the change and the reason for it before proceeding.
- Before compacting context, spit out the most important information from the conversation into `context.md` for future reference. This should include the problem statement, the proposed solution, and any important details or decisions made during the conversation.
  - Always check for the existence of this file before starting a new conversation. If it exists, read it and use it to inform your understanding of the problem and the proposed solution.
  - After the contents of `context.md` are no longer relevant, delete the file to avoid confusion in future conversations.

## Validation Expectations

- Run the smallest relevant verification for the change you made.
- Prefer targeted validation first, then broader validation if risk or scope warrants it.
- Use the project's existing scripts when applicable, including `pnpm lint`, `pnpm test`, and `pnpm test:ci`.
- If you cannot run verification, or choose not to run it, state that explicitly in your final response.

## Skill Routing

- Use `/grill-me` when the user wants to stress-test a plan or design, get grilled on their thinking, or be pushed through unresolved decision branches.
- Use `/write-a-prd` when the user asks to write a PRD, create a product requirements document, or shape a new feature definition before implementation work begins.
- Use `/prd-to-plan` when the user wants to break a PRD into an implementation plan, tracer-bullet rollout, or execution slices saved under `./plans/`.
- Use `$plan-eng-review` when the user asks for implementation-plan review, architecture review, rollout review, test-plan review, or a pre-coding technical risk review.
- Use `$plan-ceo-review` when the user asks to challenge the premise, rethink the roadmap, expand scope strategically, reduce scope to the minimum viable version, or review from a founder/product perspective.
- Use `$creative-director` when the user asks for UI direction, UX critique, branding feedback, visual identity work, desirability improvements, or help making the product feel more distinctive and memorable.
- If the user needs a PRD before execution planning, use `/write-a-prd` first and then use `/prd-to-plan`.
- If the user wants their plan challenged aggressively before it is formalized, use `/grill-me` before `/write-a-prd` or `/prd-to-plan`.
- If the request mixes product/scope shaping with implementation planning, use `$plan-ceo-review` first to settle direction, then use `$plan-eng-review` to lock the execution plan.
- If the request mixes product strategy with visual/UX direction, use `$plan-ceo-review` first to settle the product bet, then use `$creative-director` to shape how that direction should feel and present.
- Do not use these skills for routine implementation requests unless the user explicitly asks for a planning or review phase.
- If the user's intent is ambiguous but sounds close to planning or review, state which skill you are using and why before proceeding.

## Next.JS Documentation Index

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output CLAUDE.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
