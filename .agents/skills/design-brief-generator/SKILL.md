---
name: design-brief-generator
description: Generate a design brief for a feature including user flows, UI states, interactions, edge cases, and questions for design review. Use when a feature brief exists and the user wants to review or approve the proposed design direction.
---

# Design Brief Generator

Generate a design-facing artifact from the feature brief.

## Output

Write or update `./docs/features/<feature-slug>/design.md`.

Use this template:

```md
# Design Brief: <Feature Name>

## Primary flow

Describe the main user journey end-to-end.

## Screens and surfaces

- ...

## States

- Default
- Loading
- Empty
- Error
- Success

## Interactions

- Entry points
- Primary actions
- Secondary actions
- Validation and feedback

## Edge cases

- ...

## Accessibility notes

- ...

## Open design questions

- ...
```

## Process

1. Read `brief.md`.
2. Explore existing UI patterns in the repo before proposing new ones.
3. Bias toward extending existing flows and components unless a new pattern is clearly justified.
4. Surface the design questions that actually need user input.
5. Present the proposed design as a review packet, not a vague brainstorm.

