---
name: feature-owner
description: Orchestrate a new feature from request to implementation by creating a feature workspace, generating design and technical proposals, pausing for approval at those two gates, then planning and implementing reviewable chunks. Use when the user wants a feature built end-to-end with minimal input after an initial description.
---

# Feature Owner

This skill coordinates a feature workflow. It should keep the user involved only at the design and technical-shape gates unless a real blocker appears.

## Workflow contract

Create a feature workspace under `./docs/features/<feature-slug>/` with:

- `brief.md`
- `design.md`
- `tech-spec.md`
- `plan.md`
- `status.yaml`

If the folder already exists, resume from `status.yaml` instead of restarting.

## State machine

Track one of these states in `status.yaml`:

- `drafting-brief`
- `awaiting-design-approval`
- `design-approved`
- `awaiting-tech-approval`
- `tech-approved`
- `planning`
- `implementing`
- `awaiting-user-input`
- `done`

Also track:

- `feature`
- `slug`
- `current_chunk`
- `completed_chunks`
- `open_questions`
- `blockers`

## Process

1. Normalize the request with `feature-intake` and write `brief.md`.
2. Generate `design.md` with `design-brief-generator`.
3. Pause and ask for design approval or edits. Update state to `awaiting-design-approval`.
4. After approval, generate `tech-spec.md` with `tech-spec-generator`.
5. Pause and ask for technical approval or edits. Update state to `awaiting-tech-approval`.
6. After approval, generate `plan.md` with `implementation-planner`.
7. Implement one reviewable chunk at a time with `pr-executor`.
8. Run `review-guard` on each chunk before considering it complete.
9. Update `status.yaml` after every stage transition.

## Operating rules

- Do not ask broad, open-ended questions when a reasonable default exists.
- Do not skip the design or technical approval gates.
- Ask only for concrete decisions, not for restating prior context.
- Keep implementation chunks small enough to be comfortably reviewable in a single PR.
- Prefer existing repo patterns over inventing new abstractions.
- If ambiguity is minor, document the assumption in the artifact and continue.
- If ambiguity materially changes UX or architecture, stop and ask.

## Approval prompts

At the design gate, present:

- the proposed user flow
- important states and edge cases
- unresolved UX questions

At the technical gate, present:

- the proposed architecture
- APIs and schema changes
- rollout/testing implications
- the recommended approach and the main alternative

## Completion

The workflow is complete only when:

- all planned chunks are implemented or consciously deferred
- relevant tests pass or failures are explained
- `status.yaml` is updated to `done`

