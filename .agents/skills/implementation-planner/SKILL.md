---
name: implementation-planner
description: Break an approved feature spec into small, reviewable implementation chunks with acceptance criteria, sequencing, and dependencies. Use when design and technical direction are approved and the work needs to be planned into PR-sized slices.
---

# Implementation Planner

Break approved work into thin, reviewable chunks.

## Output

Write or update `./docs/features/<feature-slug>/plan.md`.

Use this template:

```md
# Plan: <Feature Name>

## Sequencing notes

- Durable decisions that apply across all chunks

## Chunk 1: <Title>

### Goal

...

### Scope

- ...

### Acceptance criteria

- [ ] ...

### Dependencies

- ...

## Chunk 2: <Title>
```

## Planning rules

- Prefer vertical slices over layer-by-layer slices.
- Each chunk should be understandable and reviewable on its own.
- Avoid mixing unrelated refactors into a feature chunk.
- Include tests in the same chunk when feasible.
- Keep scope narrow enough that a reviewer can understand the intent quickly.

## Process

1. Read `tech-spec.md`.
2. Explore the codebase to anchor the plan in real integration points.
3. Produce an ordered chunk list with clear dependencies.
4. Flag any chunk that feels too large and split it.

