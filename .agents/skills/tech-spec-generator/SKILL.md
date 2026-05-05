---
name: tech-spec-generator
description: Generate a technical proposal for a feature including architecture, APIs, schema changes, rollout, testing, and tradeoffs. Use when design direction is approved and the user wants to review the shape of the implementation before coding.
---

# Tech Spec Generator

Turn an approved brief and design direction into a technical plan the user can approve.

## Output

Write or update `./docs/features/<feature-slug>/tech-spec.md`.

Use this template:

```md
# Tech Spec: <Feature Name>

## Summary

One-paragraph description of the implementation approach.

## Affected areas

- ...

## Architecture

Describe the main modules, boundaries, and data flow.

## Data and schema

- ...

## API and contracts

- ...

## State management

- ...

## Rollout and migration

- ...

## Testing strategy

- ...

## Tradeoffs

### Recommended approach

...

### Main alternative

...

## Open technical questions

- ...
```

## Process

1. Read `brief.md` and `design.md`.
2. Explore the codebase for existing architectural patterns and prior art.
3. Recommend the simplest approach that fits current constraints.
4. Include alternatives only when they are realistic contenders.
5. Call out assumptions that would materially affect API, schema, or decomposition.

