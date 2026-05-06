---
name: feature-owner
description: Orchestrate a new feature from request to implementation by first grilling the user to reach a shared understanding, then creating a feature workspace, generating design and technical proposals, and stopping for explicit user approval before kickoff, before technical planning, and before implementation. Use when the user wants a feature built end-to-end with minimal input after an initial description.
---

# Feature Owner

This skill coordinates a feature workflow. It must first establish a mutual shared understanding of the feature, and it must never treat silence, implication, or positive sentiment as approval.

This is an orchestrator skill. Its primary job is to manage workflow state and delegate bounded tasks to sub-agents. Load the references below as needed:

- `references/status-schema.md` for the `status.yaml` contract
- `references/subagent-templates.md` for delegation templates

## Orchestrator role

The orchestrator owns:

1. reading and updating `status.yaml`
2. deciding the current workflow state
3. selecting the next bounded task
4. delegating that task to the right sub-agent
5. integrating sub-agent outputs into workflow artifacts
6. enforcing all approval gates

The orchestrator does not hand off ownership of workflow state. Sub-agents may draft artifacts, explore the repo, review a chunk, or implement a bounded change, but they do not decide state transitions.

## Delegation model

Use sub-agents to keep stages independent and narrow:

- Use `grill-me` behavior first to clarify the request and produce a shared-understanding summary.
- Use an `explorer` sub-agent for repo discovery, prior art, and integration-point lookup.
- Use a drafting sub-agent for `brief.md`, `design.md`, `tech-spec.md`, and `plan.md`.
- Use one `worker` sub-agent per implementation chunk.
- Use a review-focused sub-agent for a `review-guard` pass on each chunk.

For `tech-spec.md`, the drafting task must use three explicit perspectives: software architect, principal engineer, and product engineer. Those perspectives should challenge one another before the orchestrator accepts a recommendation.

Keep delegation narrow. Each sub-agent should receive one clearly bounded task and return one concrete output.

## Workflow contract

Create a feature workspace under `./docs/features/<feature-slug>/` with:

- `brief.md`
- `design.md`
- `tech-spec.md`
- `plan.md`
- `status.yaml`

If the folder already exists, resume from `status.yaml` instead of restarting.

Before starting any workflow work, use `grill-me` to clarify the feature request, resolve outstanding questions, and reach a shared understanding. After that, obtain explicit user approval to begin. A feature request alone is not approval to start.

## State machine

Track one of these states in `status.yaml`:

- `clarifying-request`
- `awaiting-shared-understanding-approval`
- `awaiting-kickoff-approval`
- `drafting-brief`
- `awaiting-design-approval`
- `design-approved`
- `awaiting-tech-approval`
- `tech-approved`
- `awaiting-implementation-approval`
- `planning`
- `implementing`
- `awaiting-user-input`
- `done`

Also track:

- `feature`
- `slug`
- `shared_understanding_summary`
- `current_chunk`
- `completed_chunks`
- `open_questions`
- `blockers`

When working from disk, prefer the exact schema in `references/status-schema.md`.

## Process

1. Begin in `clarifying-request` and use `grill-me` to interview the user until the feature behavior, constraints, and expected outcomes are clear.
2. Summarize the shared understanding and ask for explicit approval that the summary is correct. Set state to `awaiting-shared-understanding-approval`.
3. Only after explicit approval of the shared understanding, ask whether the user wants to start the workflow now. Set state to `awaiting-kickoff-approval`.
4. Only after explicit kickoff approval, normalize the request with `feature-intake` and write `brief.md`.
5. Generate `design.md` with `design-brief-generator`.
6. Pause and ask for explicit design approval or edits. Update state to `awaiting-design-approval`.
7. Only after explicit design approval, generate `tech-spec.md` with `tech-spec-generator`.
8. Pause and ask for explicit technical approval or edits. Update state to `awaiting-tech-approval`.
9. Only after explicit technical approval, generate `plan.md` with `implementation-planner`.
10. Pause and ask for explicit approval to begin implementation. Update state to `awaiting-implementation-approval`.
11. Only after explicit implementation approval, implement one reviewable chunk at a time with `pr-executor`.
12. Run `review-guard` on each chunk before considering it complete.
13. Update `status.yaml` after every stage transition.

## Agent execution pattern

For every state transition:

1. Read `status.yaml`.
2. Decide the next state locally in the orchestrator.
3. Spawn or reuse exactly one sub-agent for the next bounded task unless independent exploration can safely run in parallel.
4. Give the sub-agent only the context needed for that task.
5. Review the output in the orchestrator.
6. Write or update the relevant artifact.
7. Update `status.yaml`.
8. Either stop for explicit approval or continue to the next non-blocked state.

## Parallelism rules

- Parallelize only independent exploration work or independent implementation chunks with disjoint write scopes.
- Do not run parallel workers that touch the same files or modules.
- Do not parallelize across approval gates.
- Do not let a sub-agent update `status.yaml`.

## Operating rules

- Do not ask broad, open-ended questions when a reasonable default exists.
- Do not skip the clarification, shared-understanding, kickoff, design, technical, or implementation gates.
- Ask only for concrete decisions, not for restating prior context.
- Keep implementation chunks small enough to be comfortably reviewable in a single PR.
- Prefer existing repo patterns over inventing new abstractions.
- If ambiguity is minor, document the assumption in the artifact and continue.
- If ambiguity materially changes UX or architecture, stop and ask.
- Never infer approval from phrases like "looks good", "continue", or "sounds fine" unless the user is explicitly approving the named gate.
- Do not create workflow artifacts until the shared-understanding summary has been explicitly approved.
- Do not let sub-agents mutate workflow state or change the active plan on their own.
- If a sub-agent discovers a blocker or ambiguity, return control to the orchestrator for the decision.

## Resume protocol

When resuming an existing feature:

1. Read `status.yaml` first.
2. Verify which artifact is the current source of truth for the active state.
3. Summarize the current state to the user briefly.
4. If the workflow is paused at an approval gate, ask only for that approval.
5. If the workflow is mid-execution, continue from the next incomplete bounded task.

## Explicit approval policy

Accept approval only when the user clearly approves the specific gate, for example:

- `I approve this shared understanding.`
- `I approve starting the workflow.`
- `I approve the design direction.`
- `I approve the technical approach.`
- `I approve implementation to begin.`

If approval is ambiguous, ask for a clearer yes/no decision and do not proceed.

## Approval prompts

At the shared-understanding gate, present:

- the clarified feature summary
- the key decisions that were resolved during grilling
- any assumptions that remain
- a direct request for approval that this understanding is correct

At the kickoff gate, present:

- the feature summary
- the artifacts that will be created
- a direct request for approval to begin

At the design gate, present:

- the proposed user flow
- important states and edge cases
- unresolved UX questions

At the technical gate, present:

- the proposed architecture
- APIs and schema changes
- rollout/testing implications
- the recommended approach and the main alternative

At the implementation gate, present:

- the planned chunks
- the first chunk to be executed
- any known risks before code changes start

## Completion

The workflow is complete only when:

- all planned chunks are implemented or consciously deferred
- relevant tests pass or failures are explained
- `status.yaml` is updated to `done`
