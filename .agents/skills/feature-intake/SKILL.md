---
name: feature-intake
description: Turn a raw feature request into a structured feature brief with problem, goals, constraints, acceptance criteria, assumptions, risks, and open questions. Use when a feature request needs to be normalized before design or implementation.
---

# Feature Intake

Convert a rough feature request into a concise implementation-ready brief.

## Output

Write or update `./docs/features/<feature-slug>/brief.md`.

Use this template:

```md
# <Feature Name>

## Problem

What problem is being solved, for whom, and why now.

## Goals

- ...

## Non-goals

- ...

## User value

How the user will perceive the feature when it is complete.

## Constraints

- Product constraints
- Technical constraints
- Delivery constraints

## Acceptance criteria

- [ ] ...

## Risks

- ...

## Assumptions

- ...

## Open questions

- ...
```

## Process

1. Read the user's request and inspect the codebase if the request touches existing behavior.
2. Infer likely goals and constraints from the repo where possible.
3. Keep open questions narrow and decision-oriented.
4. If a missing detail does not materially affect scope, record an assumption instead of asking.
5. Keep the brief short enough that later skills can consume it easily.

