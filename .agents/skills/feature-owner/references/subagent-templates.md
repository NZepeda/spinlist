# Sub-Agent Templates

Use these as task shapes for spawned sub-agents. Keep the ask narrow and preserve orchestrator ownership of workflow state.

## Clarification agent

Use when state is `clarifying-request`.

Task template:

```text
Interview the user to clarify this feature request until there is a shared understanding of behavior, constraints, edge cases, and expected outcomes. Ask concrete decision-oriented questions. Resolve what you can from repo context. Return:
1. a concise shared-understanding summary
2. remaining open questions
3. assumptions that were made
Do not approve anything and do not create workflow artifacts.
```

## Explorer agent

Use for prior art and integration-point lookup.

Task template:

```text
Explore the codebase for existing patterns relevant to this feature. Focus on affected modules, APIs, UI patterns, and tests. Return only the findings needed for the current stage, with file references and risks. Do not edit files.
```

## Drafting agent

Use for `brief.md`, `design.md`, `tech-spec.md`, or `plan.md`.

Task template:

```text
Draft the requested artifact based on the approved workflow inputs and current repo patterns. Keep the artifact concise, concrete, and aligned with the current stage. Return the proposed artifact content and any narrow unresolved questions. Do not update workflow state.
```

### Tech-spec variant

When drafting `tech-spec.md`, use this stronger template:

```text
Draft the tech spec from three perspectives on the same problem:
1. software architect
2. principal engineer
3. product engineer

Have these perspectives explicitly challenge each other on boundaries, risk, speed, complexity, and scalability. Do not produce three isolated mini-specs. Produce one debated proposal that includes:
- each perspective's main concerns
- the core disagreements
- the tradeoffs surfaced by the debate
- the agreed recommended solution
- the main alternative that was seriously considered

Balance delivery speed with technical robustness and future scale. Keep the result grounded in the current repo patterns and constraints. Do not update workflow state.
```

## Implementation worker

Use one worker per chunk.

Task template:

```text
Implement exactly one approved chunk from the feature plan.
Ownership:
- Only touch files needed for this chunk.
- You are not alone in the codebase; do not revert others' work.
Requirements:
- Follow the approved tech spec and plan.
- Keep the diff narrow and reviewable.
- Add or update relevant tests.
- Report changed files, validation run, and follow-up work.
Do not update workflow state or expand scope into future chunks.
```

## Review agent

Use after a worker completes a chunk.

Task template:

```text
Review the current chunk with a code-review mindset. Focus on regressions, missing tests, rollout risk, and scope creep. Return findings first in severity order. If no findings exist, say so explicitly and mention any residual risks. Do not edit files or update workflow state.
```
