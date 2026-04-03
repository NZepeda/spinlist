# PRD: Lightweight Production Observability

## Problem Statement

Spinlist currently has only partial production observability.
The app can emit structured server logs and basic Vercel Analytics events, but production failures are still difficult to detect, group, triage, and trace back to the route or user flow that caused them.
Client-side failures are not captured in a unified way, server-side failures are inconsistently reported, and it is too hard to answer whether a broken experience came from Spinlist itself, Spotify, or Supabase.
For a small project, the current setup creates too much operational ambiguity without providing enough actionable insight.
Spinlist needs a lightweight observability layer that makes production failures visible quickly, preserves user privacy, and adds just enough latency visibility to debug key flows without introducing unnecessary infrastructure complexity.

## Solution

Spinlist will add a lightweight hosted observability stack centered on Sentry for error monitoring, alerting, release tracking, source maps, targeted tracing, and replay-on-error.
The app will keep Vercel Analytics for page-level analytics and web vitals, and it will keep its structured server logs as a secondary debugging and correlation surface.
Observability will focus on the highest-value experiences: album and artist page loads, search, slug resolution, review creation and mutation, Spotify dependency calls, and Supabase-backed auth and review flows.
Unexpected client and server exceptions will be captured automatically, while expected business outcomes such as validation failures, unauthorized responses, and email-confirmation gates will remain out of the main error stream.
The implementation will include strict redaction rules so search queries, review text, auth inputs, cookies, and authorization headers are never sent to the monitoring provider.
Sampling will remain conservative by default, with broad low-rate tracing and full tracing on the small set of user flows that matter most operationally.

## User Stories

1. As the Spinlist operator, I want to know when a new production error happens, so that I can react before users keep hitting the same failure.
2. As the Spinlist operator, I want errors to be grouped by root cause, so that recurring failures do not look like unrelated incidents.
3. As the Spinlist operator, I want to see whether an error happened in the browser or on the server, so that I can start debugging in the right place.
4. As the Spinlist operator, I want each production error to include route and execution context, so that I can understand which part of the app failed.
5. As the Spinlist operator, I want to correlate an API failure with a request identifier, so that I can connect monitoring events to platform logs and responses.
6. As the Spinlist operator, I want a monitoring event identifier returned or logged for true server failures, so that a single incident can be traced across systems.
7. As the Spinlist operator, I want client-side crashes captured automatically, so that silent browser failures do not go unnoticed.
8. As the Spinlist operator, I want server-side uncaught exceptions captured automatically, so that route handlers and render failures surface consistently.
9. As the Spinlist operator, I want preview and production events separated by environment, so that noisy pre-release work does not pollute production triage.
10. As the Spinlist operator, I want lightweight email alerts for new or severe production failures, so that I do not need to manually watch dashboards.
11. As the Spinlist operator, I want dashboard access to recent incidents and trends, so that I can see whether quality is improving or regressing.
12. As the Spinlist operator, I want release tracking and source maps, so that browser stack traces resolve to useful source locations.
13. As the Spinlist operator, I want replay only when an error occurs, so that I get debugging context without turning on broad session recording.
14. As the Spinlist operator, I want only a small amount of tracing by default, so that observability stays within free-tier limits.
15. As the Spinlist operator, I want critical product flows traced at a higher rate, so that the most important failures and slowdowns remain diagnosable.
16. As a listener using search, I want broken search experiences to be diagnosable by route and dependency, so that failures can be fixed quickly.
17. As a listener opening an album page, I want page-load failures to be visible to the team, so that broken album experiences are not discovered only through complaints.
18. As a listener opening an artist page, I want external dependency failures to be obvious internally, so that upstream Spotify issues can be distinguished from app defects.
19. As a listener submitting a review, I want failed review saves to be observable with enough metadata to debug safely, so that broken write flows can be restored quickly.
20. As a listener deleting or editing a review, I want unexpected failures in review mutations to be visible to the team, so that moderation and participation flows remain reliable.
21. As the Spinlist operator, I want Spotify failures tagged explicitly as Spotify dependency failures, so that I can answer whether an incident is upstream-related.
22. As the Spinlist operator, I want Supabase failures tagged explicitly as Supabase dependency failures, so that auth and persistence problems are easy to isolate.
23. As the Spinlist operator, I want a consistent monitoring wrapper across the app, so that reporting behavior does not drift between modules.
24. As the Spinlist operator, I want user correlation to use only an internal user identifier, so that I can debug account-scoped failures without collecting extra personal data.
25. As the Spinlist operator, I want logged-in and anonymous sessions handled consistently, so that observability works for both authenticated and public flows.
26. As the Spinlist operator, I want expected validation and authorization responses excluded from the main error stream, so that alerting stays focused on real defects.
27. As the Spinlist operator, I want sensitive auth and content inputs redacted before events leave the app, so that observability does not create a privacy liability.
28. As the Spinlist operator, I want search text redacted from traces and errors, so that user intent is not unnecessarily stored in monitoring tools.
29. As the Spinlist operator, I want review text redacted from traces and errors, so that user-generated content is not copied into operational tooling.
30. As the Spinlist operator, I want cookies and authorization headers excluded from monitoring payloads, so that secrets never leave the application boundary.
31. As the Spinlist operator, I want local development to stay quiet by default, so that daily development work does not flood the monitoring backend.
32. As the Spinlist operator, I want preview environments captured at lower volume than production, so that I can validate integrations without wasting quota.
33. As the Spinlist operator, I want observability modules to be deep and reusable, so that future instrumentation work can be added without scattering provider-specific code.
34. As the Spinlist operator, I want the first observability version to stay intentionally small, so that I gain real production visibility without committing to a heavy platform.

## Implementation Decisions

- Use Sentry as the primary observability provider for error monitoring, tracing, release tracking, source maps, environment separation, replay-on-error, and email-based alerting.
- Keep Vercel Analytics as the existing lightweight analytics layer for page-level traffic and web-vitals visibility.
- Keep structured server logs as a secondary debugging surface and preserve their role in platform-native runtime log inspection.
- Introduce a dedicated observability bootstrap module that owns provider initialization, environment gating, release metadata, sampling policy, and redaction policy.
- Introduce a monitoring facade module that exposes a stable, provider-agnostic interface for exception capture, breadcrumb capture, span creation, user correlation, request correlation, and event enrichment.
- Introduce a privacy and redaction module that strips or suppresses search queries, review text, auth form values, cookies, authorization headers, and any other sensitive payload fields before telemetry is emitted.
- Introduce a request-correlation module that standardizes request identifiers, environment metadata, route metadata, and monitoring event identifiers across API failures and server logs.
- Introduce a user-context module that attaches only the internal authenticated user identifier when available and never sends email addresses or profile metadata.
- Instrument the highest-value app flows first: album page load, artist page load, search route, slug route, review route, Spotify token acquisition, Spotify resource fetches, and key Supabase-backed reads and writes related to auth, slug resolution, and reviews.
- Treat Spotify and Supabase as first-class dependencies in observability metadata, including explicit dependency tags and dependency-aware error context.
- Capture unexpected client and server exceptions automatically, but do not create monitoring issues for expected `400`, `401`, or `403` business outcomes.
- Preserve expected business responses as normal application behavior and allow structured logs or breadcrumbs to record them only when they are operationally useful.
- Use conservative default tracing with elevated sampling for key user flows rather than broad full-app tracing.
- Enable replay only for sessions that encounter an error and keep always-on replay disabled.
- Enable production alerting through email only in the first version and keep preview traffic visible without alert routing.
- Keep local observability disabled by default and allow explicit local enablement through environment configuration when needed.
- Avoid schema changes for the initial observability rollout.
- Avoid introducing an OpenTelemetry collector, metrics backend, custom dashboards beyond the hosted provider, or any multi-vendor tracing pipeline in the first version.
- Favor deep modules over direct provider imports so future provider changes, privacy changes, and sampling changes remain centralized.

## Testing Decisions

- Good tests should validate observable behavior and contract-level outcomes rather than provider internals or incidental implementation details.
- Good tests should assert what metadata is preserved, what data is redacted, which failures are reported, which expected outcomes are suppressed, and how environment gating changes behavior.
- The observability bootstrap module should be tested for production, preview, and local initialization behavior, including release metadata, environment selection, and enablement rules.
- The monitoring facade should be tested to confirm that exception capture, span creation, breadcrumb capture, and user-context attachment normalize the app's contracts without leaking provider-specific concerns.
- The privacy and redaction module should be tested aggressively to ensure sensitive fields are removed from error events, breadcrumbs, request metadata, and span attributes before emission.
- The request-correlation module should be tested for stable request identifier behavior, event identifier propagation, and consistent route metadata attachment across monitored server failures.
- The dependency instrumentation layer should be tested for Spotify and Supabase tagging behavior, including the distinction between expected upstream outcomes and actionable failures.
- The route-level monitoring behavior should be tested for search, slug, and review flows to ensure unexpected failures are reported while expected validation or authorization outcomes are not.
- The client-side monitoring behavior should be tested at the behavior level for bootstrap, user-context attachment, and failure capture entry points rather than SDK implementation details.
- Prior art for behavior-first route tests exists in the review route tests that validate meaningful HTTP outcomes at the request boundary.
- Prior art for auth-aware provider bootstrap behavior exists in the auth provider tests that assert user-visible state from initialization inputs.
- Prior art for action-level error mapping exists in the login action tests that distinguish expected product outcomes from unexpected failures.
- Prior art for environment-sensitive utility behavior exists in the canonical site URL tests that validate behavior across local, preview, and production contexts.

## Out of Scope

- A full OpenTelemetry collector or vendor-neutral tracing pipeline.
- Always-on session replay.
- Broad tracing across every request and every database operation.
- New product analytics, funnel analytics, or marketing attribution work.
- A custom logs pipeline, logs database, or long-term log retention project.
- Alert routing to external integrations beyond simple email notifications in the first version.
- Collection of user email addresses, review text, search text, auth inputs, cookies, or authorization headers in the monitoring backend.
- Any schema migration or database redesign.
- A large-scale incident management workflow, on-call tooling, or enterprise observability process.

## Further Notes

- This observability effort is intentionally small and operationally focused.
- The success condition is not exhaustive telemetry.
- The success condition is being able to answer, quickly and safely, what failed in production, where it failed, whether the failure came from Spinlist, Spotify, or Supabase, and whether the issue is affecting a critical user flow.
- The first version should optimize for clarity, privacy, and low ongoing maintenance burden.
