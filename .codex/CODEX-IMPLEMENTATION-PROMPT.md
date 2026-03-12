# Codex prompt — implement the greentic-webchat migration in stages

Work in the `greentic-webchat` repository.

You are implementing a staged migration informed by:

1. the local codebase,
2. the `zain-network` codebase if available locally,
3. the uploaded Zain AI Network Assistant workshop deck,
4. the product decisions already agreed for login, i18n, product/tenant config, remote config loading, DirectLine tenancy, and guided Adaptive Card flows.

## First instruction

Do **not** start making broad behavioural changes immediately.

Start by producing the audit outputs described in `PR-WEBCHAT-00-audit.md`.

If `zain-network` is not available locally or the supplied GitHub URL is inaccessible, say so explicitly in the audit and continue using only the available sources.

## Before coding real changes

After the audit docs are complete, ask ChatGPT for a validation pass.

Use the prompt in `CHATGPT-VALIDATION-PROMPT.md`.

Include:

- current-state findings
- implementation delta
- file touch map
- risk register
- proposed PR sequence

Do not proceed to the implementation PRs until that validation pass has been reviewed and any major gaps are reflected in the plan.

## What to do next after the audit

Do **not** immediately implement all PRs after the audit.

Instead follow this sequence:

### Phase 1 — Validate the audit against the actual codebase

Re-check the audited assumptions against the current repository state for both:

- `greentic-webchat`
- `../zain-network`

Output:

- confirmed findings
- corrected findings
- any new risks discovered
- any recommended PR sequence changes

### Phase 2 — Produce a concrete implementation readiness report

Before changing code, generate a readiness report covering:

- exact source-of-truth files for WebChat boot
- exact source-of-truth files for tenant resolution
- exact source-of-truth files for runtime config loading
- exact source-of-truth files for auth/login entry
- exact source-of-truth files for i18n boot
- exact source-of-truth files for guided playbook insertion
- all duplicate/generated/static files that should not be edited first

Also identify:

- which files are highest regression risk
- which files can be safely added without destabilising WebChat

### Phase 3 — Ask ChatGPT for validation before real changes

Using `.codex/CHATGPT-VALIDATION-PROMPT.md` and `docs/audit/pre-change-validation.md`, generate the exact ChatGPT prompt payload that should be reviewed before implementation.

Do not start coding until this validation prompt has been prepared.

### Phase 4 — Prepare PR-01 only

After the validation prompt is prepared, implement `PR-WEBCHAT-01-runtime-config-foundation.md` only.

Constraints for PR-01:

- preserve Microsoft Bot Framework WebChat behavior
- preserve existing `skin.json` boot path as a bridge
- do not introduce auth yet
- do not introduce guided playbooks yet
- do not replace chat rendering
- keep changes additive and reversible

Stop after PR-01 and wait for review.

## Then implement in this order

1. `PR-WEBCHAT-01-runtime-config-foundation.md`
2. `PR-WEBCHAT-02-auth-i18n-shell.md`
3. `PR-WEBCHAT-03-webchat-branding-directline.md`
4. `PR-WEBCHAT-04-guided-adaptive-card-playbooks.md`
5. `PR-WEBCHAT-05-validation-gate.md`

## Constraints

- Keep Microsoft Bot Framework WebChat working.
- Use standard Adaptive Cards only inside chat.
- Do not introduce a custom chat protocol/rendering path.
- Keep changes staged and reviewable.
- Prefer runtime config over hardcoding.
- Treat auth, locale, and tenant changes as high-risk and cover them with tests.

## Required outputs per stage

For each PR stage:

- update docs,
- make code changes,
- add or update tests,
- provide a concise reviewer checklist,
- state what was intentionally left out.

For each PR, always return these sections:

### 1. Files changed

Provide:

- new files
- modified files
- deleted files
- any files intentionally left untouched because of Bot Framework safety

### 2. What changed and why

Per file, explain briefly:

- purpose of the change
- how it maps to the PR scope
- what existing behavior was preserved

### 3. Diff-risk notes

Explicitly call out:

- anything touching `bootstrap.ts`
- anything touching Direct Line setup
- anything touching tenant resolution
- anything touching tenant hooks
- anything touching WebChat render boot

### 4. Validation evidence

Actually run and report:

- typecheck result
- build result
- skin/config validation result
- any unit tests added
- manual smoke checks performed
- exact commands run

### 5. Screens / behavior proof

For UI-affecting PRs provide:

- screenshots, or described screenshots if screenshots are unavailable
- which tenant was tested
- which URL pattern was tested
- what locale was tested
- what login/provider behavior was tested

### 6. Explicit compatibility statement

Answer clearly:

- whether Microsoft Bot Framework WebChat still loads from the official CDN
- whether `createDirectLine` still uses standard semantics
- whether `renderWebChat` still mounts into the same safe DOM seam
- whether guided flows are still standard Adaptive Cards only
- whether any custom chat renderer was introduced

If any custom chat renderer is introduced, treat that as a stop sign and say so explicitly.

### 7. Known gaps

List:

- what is stubbed
- what is demo-only
- what is intentionally deferred
- what would block production use

## Final check

Before concluding the work, run the ChatGPT validation prompt again using the actual changed state and verify:

- Bot Framework boot still works,
- standard Adaptive Cards still render,
- tenant/product config loads correctly,
- dummy login works,
- OIDC buttons build real authorization redirects,
- locale dropdown works with native names and `variant -> base -> en` fallback,
- Arabic variants switch RTL,
- tenant DirectLine and tenant navigation are respected.
