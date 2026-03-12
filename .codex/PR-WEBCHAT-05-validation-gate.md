# PR-WEBCHAT-05 — Add a validation gate before and after real changes

## Goal

Before Codex starts making behavioural changes, and again before merge, it must ask ChatGPT for an external validation pass using a structured prompt.

This PR adds the validation process, prompts, and acceptance checklist.

## Why

This work touches:

- auth
- locale handling
- tenant resolution
- remote config
- Bot Framework boot
- Adaptive Card rendering
- top navigation
- branding

That is exactly the kind of work where a second structured review catches missed edges.

## Process

### Phase 1 — Pre-change validation

After the audit PR is prepared, Codex must run the `CHATGPT-VALIDATION-PROMPT.md` prompt with:

- audit findings,
- planned file touch map,
- proposed PR sequence.

ChatGPT should be asked to validate:

- architecture
- migration sequencing
- compatibility risks
- missing edge cases
- test gaps

### Phase 2 — Post-change validation

Before final merge, Codex must run the same validation prompt again, now including:

- actual changed files
- screenshots or route summaries if available
- test results
- known deviations from plan

## Acceptance criteria

- Validation prompt exists and is usable by a human reviewer.
- Codex implementation prompt explicitly requires a ChatGPT validation loop.
- Merge checklist includes pre-change and post-change review.
