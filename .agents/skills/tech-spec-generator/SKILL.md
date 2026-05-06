---
name: tech-spec-generator
description: Generate a technical proposal for a feature including architecture, APIs, schema changes, rollout, testing, and tradeoffs. Evaluate the problem from software architect, principal engineer, and product engineer perspectives, force those perspectives to challenge each other, and present a synthesized recommendation. Use when design direction is approved and the user wants to review the shape of the implementation before coding.
---

# Tech Spec Generator

Turn an approved brief and design direction into a technical plan the user can approve.

The tech-spec stage must incorporate three perspectives on the same problem:

- software architect
- principal engineer
- product engineer

Those perspectives should disagree where appropriate, pressure-test each other's assumptions, and converge on a recommended approach that balances speed, technical robustness, and future scale.

## Output

Write or update `./docs/features/<feature-slug>/tech-spec.md`.

Use this template:

```md
# Tech Spec: <Feature Name>

## Summary

One-paragraph description of the implementation approach.

## Perspective debate

### Software architect view

Focus on system boundaries, long-term maintainability, interfaces, and scale constraints.

### Principal engineer view

Focus on technical risk, correctness, operational reliability, and failure modes.

### Product engineer view

Focus on delivery speed, pragmatic scope, user impact, and minimizing unnecessary complexity.

### Debate summary

Summarize where the perspectives disagreed, what tradeoffs were surfaced, and what changed because of the debate.

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

### Why the recommendation won

Explain why the final recommendation best balances speed, robustness, and scalability relative to the alternatives.

## Open technical questions

- ...
```

## Process

1. Read `brief.md` and `design.md`.
2. Explore the codebase for existing architectural patterns and prior art.
3. Evaluate the problem from three explicit viewpoints: software architect, principal engineer, and product engineer.
4. Force those viewpoints to challenge one another rather than merely listing parallel opinions.
5. Recommend the simplest approach that fits current constraints without creating obvious scaling or architectural traps.
6. Include alternatives only when they are realistic contenders.
7. Call out assumptions that would materially affect API, schema, or decomposition.
8. Make the final recommendation a synthesis, not a majority vote or a bland compromise.

## Perspective guidance

### Software architect

- Optimize for clear boundaries, coherent interfaces, and scalability.
- Look for coupling, ownership confusion, and design decisions that will age poorly.
- Push back on shortcuts that create brittle architecture.

### Principal engineer

- Optimize for correctness, reliability, observability, and technical risk reduction.
- Look for edge cases, migration hazards, operational issues, and failure modes.
- Push back on solutions that seem fast but are hard to reason about under production load.

### Product engineer

- Optimize for speed of delivery, product impact, and minimal necessary complexity.
- Look for scope reduction opportunities and paths that reuse existing patterns.
- Push back on over-engineering that does not materially improve present needs.

## Output standard

The resulting `tech-spec.md` should read like a debated and defended proposal, not a generic checklist. The disagreement should sharpen the recommendation.
