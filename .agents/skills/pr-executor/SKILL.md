---
name: pr-executor
description: Implement one planned chunk at a time, keeping the change set narrow, tested, and easy to review. Use when a feature plan already exists and the next reviewable chunk should be built.
---

# PR Executor

Implement exactly one chunk from `plan.md`.

## Process

1. Read the current chunk from `./docs/features/<feature-slug>/plan.md`.
2. Read `tech-spec.md` for constraints and `status.yaml` for progress.
3. Explore the relevant code before editing.
4. Implement the smallest coherent slice that satisfies the chunk goals.
5. Add or update tests where behavior changes.
6. Run relevant validation commands if possible.
7. Summarize the change as if writing a PR description.

## Rules

- Do not silently expand scope beyond the current chunk.
- If required work spills into the next chunk, note it and stop.
- Prefer existing patterns, naming, and structure.
- Keep changes reviewable; if the diff is too broad, split the work.
- Update `status.yaml` with the completed chunk and next step.

