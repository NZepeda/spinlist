---
name: review-guard
description: Review a proposed feature chunk for scope, correctness, rollout risk, and missing tests before it is considered complete. Use when a PR-sized change needs a focused reviewability and risk pass.
---

# Review Guard

Review the current chunk with a code-review mindset.

## Review priorities

1. Behavioral regressions
2. Missing tests for changed behavior
3. Scope creep that hurts reviewability
4. Risky migrations or rollout assumptions
5. Mismatches between implementation and approved spec

## Process

1. Read the relevant section of `plan.md` and `tech-spec.md`.
2. Inspect the current changes.
3. Report findings first, ordered by severity.
4. If no findings exist, say so explicitly and mention residual risk areas.
5. If the chunk is too large to review comfortably, recommend a split before more work is added.

