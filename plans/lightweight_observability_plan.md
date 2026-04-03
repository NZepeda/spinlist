# Plan: Lightweight Production Observability

> Source PRD: `plans/prd_lightweight_observability.md` and GitHub issue `#20`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - Existing route surfaces remain in place, with observability focused first on `/api/search`, `/api/slug`, `/api/reviews`, album page loads, and artist page loads.
  - Server request failures continue to flow through the application's centralized request-level instrumentation hook.
  - True server failures should preserve request-correlation behavior across API responses, hosted monitoring, and platform logs.
- **Schema**:
  - No database schema changes are required for the initial observability rollout.
  - Existing request, review, album, artist, and profile data models provide the operational context needed for the first version.
- **Key models**:
  - Monitoring event: normalized error or trace event emitted to the hosted observability provider.
  - Request context: route, method, request identifier, environment, and execution metadata attached to monitored failures.
  - User context: internal authenticated user identifier only, with no email or profile metadata.
  - Dependency context: explicit metadata identifying Spotify or Supabase as the upstream system involved in a traced or failed operation.
- **Authentication and authorization**:
  - Logged-in user correlation uses only the internal user identifier when available.
  - Expected `400`, `401`, and `403` business outcomes remain normal application behavior and should not create monitoring issues.
  - Monitoring must not capture auth form inputs, cookies, or authorization headers.
- **Third-party boundaries**:
  - Sentry is the primary observability provider for error monitoring, tracing, release tracking, source maps, replay-on-error, and email alerting.
  - Vercel Analytics remains the app's lightweight analytics and web-vitals layer.
  - Vercel runtime logs and the app's structured server logs remain the secondary debugging and correlation surface.
  - Spotify and Supabase are treated as first-class dependency boundaries in observability metadata.
- **Privacy and sampling**:
  - Observability follows Sentry's privacy-first defaults, including `sendDefaultPii: false`, limited explicit user context, and SDK-side filtering for clearly sensitive fields.
  - Cookies, authorization headers, passwords, tokens, secrets, request bodies, and keyed email fields must be redacted before telemetry leaves the app.
  - Full request URLs and query strings may flow through to the provider's standard scrubbing pipeline.
  - Production tracing remains low-sample by default, with elevated sampling on key routes and dependency flows.
  - Replay is enabled only for sessions that encounter an error.
  - Preview environments emit lower-volume telemetry without production alert routing.
  - Local development stays disabled by default unless observability is explicitly enabled.

---

## Phase 1: Observability Bootstrap

**User stories**: 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 31, 32

### What to build

Establish the hosted observability baseline for Spinlist.
This slice should make production-ready client and server exception capture work end to end, separate environments cleanly, attach release metadata and source maps, support replay-on-error, and preserve the existing analytics and server-log surfaces.
The result should be a demoable path where an unexpected client or server failure appears in the monitoring provider with the correct environment and release context.

### Acceptance criteria

- [ ] Unexpected client and server exceptions are captured in the hosted provider in a production-ready configuration.
- [ ] Production, preview, and local environments follow the agreed enablement and alerting boundaries.
- [ ] Release tracking and source maps are configured so browser-side failures resolve to useful source context.
- [ ] Replay is enabled only for sessions that encounter an error.

---

## Phase 2: Safe Monitoring Facade and Redaction Policy

**User stories**: 5, 6, 23, 24, 25, 27, 28, 29, 30, 33, 34

### What to build

Introduce the shared observability contract used by the rest of the app.
This slice should centralize exception capture, breadcrumbs, spans, user correlation, request correlation, event identifiers, and privacy redaction behind a stable app-facing interface.
The result should be a complete vertical slice where monitored failures carry safe request and user context without leaking sensitive values.

### Acceptance criteria

- [ ] The app uses a shared observability interface instead of scattering provider-specific behavior throughout feature code.
- [ ] Request identifiers and hosted monitoring event identifiers can be correlated across monitored server failures and logs.
- [ ] Logged-in user correlation is limited to the internal user identifier and excludes email or profile metadata.
- [ ] The shared observability interface keeps telemetry aligned with Sentry's privacy defaults by redacting clearly sensitive fields while avoiding broader custom data collection.

---

## Phase 3: Search and Slug Flow Instrumentation

**User stories**: 4, 5, 6, 14, 15, 16, 21, 22, 26

### What to build

Instrument the discovery routes that users depend on to reach album and artist pages.
This slice should make search and slug resolution observable end to end, with route metadata, request correlation, dependency-aware context, and clear suppression of expected non-error outcomes.
The result should be a verifiable path where unexpected failures in discovery are easy to detect and diagnose without cluttering the error stream with normal validation behavior.

### Acceptance criteria

- [ ] Search and slug-resolution failures emit monitoring events with route and request context.
- [ ] Expected business outcomes in discovery flows do not create monitoring issues.
- [ ] Dependency-aware metadata makes it clear whether a discovery failure originated inside Spinlist or in an upstream service.
- [ ] Automated tests validate route-level reporting and suppression behavior for discovery flows.

---

## Phase 4: Spotify Dependency Tracing

**User stories**: 15, 16, 17, 18, 21, 26

### What to build

Extend observability into the Spotify dependency boundary that powers search and content reads.
This slice should trace Spotify token acquisition and Spotify resource fetches with explicit dependency metadata, latency visibility, and actionable failure context.
The result should be a complete debugging path where the team can tell quickly whether a broken read experience came from Spotify or from Spinlist.

### Acceptance criteria

- [ ] Spotify token and resource fetches are traced with explicit Spotify dependency metadata.
- [ ] Unexpected Spotify-related failures are distinguishable from internal application failures.
- [ ] Key Spotify-backed read flows provide enough latency visibility to diagnose slow upstream behavior.
- [ ] Automated tests validate dependency tagging and expected-versus-actionable failure handling for Spotify flows.

---

## Phase 5: Review and Supabase Write Flow Instrumentation

**User stories**: 4, 5, 6, 15, 19, 20, 22, 26

### What to build

Instrument the critical write path for review creation and mutation together with the Supabase operations it depends on.
This slice should make true write failures visible with request, user, and dependency context while preserving the rule that expected validation and authorization outcomes are not treated as monitoring issues.
The result should be a complete path for diagnosing broken review saves, updates, and deletes in production.

### Acceptance criteria

- [ ] Unexpected review-write failures emit monitoring events with safe request, user, and dependency context.
- [ ] Expected validation, unauthorized, and participation-gate outcomes do not create monitoring issues.
- [ ] Supabase-backed failures in the review flow are explicitly identifiable as Supabase dependency problems.
- [ ] Automated tests validate reporting and suppression behavior for the review write flow.

---

## Phase 6: Album and Artist Page Load Tracing

**User stories**: 4, 15, 17, 18, 21, 22

### What to build

Extend targeted tracing through the main album and artist experiences.
This slice should connect server-rendered page-load behavior to route metadata, dependency context, and key latency signals so the app's most visible read surfaces are operationally diagnosable.
The result should be a complete trace path from page request to the upstream work required to render the experience.

### Acceptance criteria

- [ ] Album and artist page loads include targeted trace coverage with route and dependency context.
- [ ] Page-load failures are visible with enough context to distinguish application, Spotify, and Supabase causes.
- [ ] Key latency signals for the main read experiences are captured at the agreed sampling levels.
- [ ] Automated tests validate page-load instrumentation contracts at the behavior level where practical.

---

## Phase 7: Noise Reduction and Operational Hardening

**User stories**: 1, 2, 9, 10, 11, 14, 26, 34

### What to build

Tune the observability system so it remains useful in day-to-day operation.
This slice should harden sampling policies, ignore non-actionable noise, verify alert behavior, and ensure quota use remains aligned with the lightweight goal of the project.
The result should be an observability setup that operators can trust without constant maintenance or excessive signal pollution.

### Acceptance criteria

- [ ] Sampling behavior matches the agreed low-default and high-value-flow strategy.
- [ ] Known non-actionable error classes and expected outcomes are suppressed from the main operational workflow.
- [ ] Production alerting behaves as expected without preview or local noise.
- [ ] The final observability setup remains within the intended lightweight operational footprint.
