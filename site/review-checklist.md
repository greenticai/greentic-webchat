# Merge Review Checklist

Use this checklist before merge.

## Pre-change validation

- Audit docs prepared and reviewed.
- `docs/audit/pre-change-validation.md` prepared.
- Exact pre-change ChatGPT payload prepared or stored in `docs/audit/pre-change-validation-prompt.md`.
- External ChatGPT validation pass completed.
- Any material feedback from that pass reflected in the plan.

## Stage-by-stage implementation review

- Each PR reported:
  - changed files
  - what changed and why
  - diff-risk notes
  - validation evidence
  - screens or behavior proof
  - explicit compatibility statement
  - known gaps
- Bot Framework-safe seams were checked after each risky PR:
  - official CDN load
  - `createDirectLine`
  - `renderWebChat`
  - no custom renderer

## Post-change validation

- `docs/audit/post-change-validation.md` prepared.
- Exact post-change ChatGPT payload prepared or stored in `docs/audit/post-change-validation-prompt.md`.
- External ChatGPT validation pass completed against the actual implementation.
- Any remaining amber/red findings triaged and documented.

## Final merge gate

- `npm run -w apps/webchat-spa typecheck` passed.
- `npm run test:runtime-config` passed.
- `npm run validate:skins` passed.
- `npm run build` passed.
- Known demo-only or deferred areas documented.
- No custom chat renderer was introduced.
