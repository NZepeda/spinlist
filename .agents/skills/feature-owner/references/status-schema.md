# Status Schema

Use this schema when creating or updating `./docs/features/<feature-slug>/status.yaml`.

```yaml
feature: "<human readable feature name>"
slug: "<feature-slug>"
state: "clarifying-request"
shared_understanding_summary: ""
current_chunk: ""
completed_chunks: []
open_questions: []
blockers: []
artifacts:
  brief: "./docs/features/<feature-slug>/brief.md"
  design: "./docs/features/<feature-slug>/design.md"
  tech_spec: "./docs/features/<feature-slug>/tech-spec.md"
  plan: "./docs/features/<feature-slug>/plan.md"
last_completed_step: ""
next_step: ""
updated_at: "<ISO-8601 timestamp>"
```

## State meanings

- `clarifying-request`: the user is being interviewed and no artifacts should exist yet beyond `status.yaml` if needed
- `awaiting-shared-understanding-approval`: waiting for explicit approval of the clarified summary
- `awaiting-kickoff-approval`: waiting for explicit approval to start workflow artifact creation
- `drafting-brief`: generating or revising `brief.md`
- `awaiting-design-approval`: `design.md` exists and is waiting for explicit approval
- `design-approved`: design direction is approved
- `awaiting-tech-approval`: `tech-spec.md` exists and is waiting for explicit approval
- `tech-approved`: technical direction is approved
- `awaiting-implementation-approval`: `plan.md` exists and implementation is waiting for explicit approval
- `planning`: generating or revising the implementation plan
- `implementing`: one implementation chunk is in flight
- `awaiting-user-input`: paused on a blocker or narrow decision outside the standard gates
- `done`: workflow is complete

## Ownership rules

- Only the orchestrator updates `state`.
- Only the orchestrator decides `next_step`.
- Workers may suggest updates, but they do not write `status.yaml`.
