# PR-WEBCHAT-00 — Audit `greentic-webchat` and `zain-network`, capture the delta, freeze the implementation plan

## Goal

Before changing production behaviour, perform a structured audit of:

- the current `greentic-webchat` codebase,
- the `zain-network` codebase and assets that should be harvested into `greentic-webchat`,
- the already-live UX direction discussed for login, i18n, tenanting, and guided Adaptive Card flows,
- Microsoft Bot Framework compatibility boundaries that must not be broken.

This PR is documentation, inventory, and acceptance scaffolding only. No risky behavioural changes yet.

## Why this PR exists

A large part of the requested work is cross-cutting:

- multi-product / multi-tenant runtime config,
- per-tenant Bot Framework / Adaptive Card appearance,
- per-tenant DirectLine endpoint wiring,
- OIDC login provider buttons,
- large locale registry + fallback + RTL,
- guided Zain/Telia playbooks inside standard Adaptive Cards.

Trying to implement all of that without an audit will create regressions, especially around WebChat bootstrapping and Bot Framework compatibility.

## Inputs

### Product decisions already agreed

- Keep Microsoft Bot Framework WebChat working.
- Keep standard Adaptive Cards only inside chat.
- Replace username/password with config-driven login buttons.
- Support real OIDC redirects, plus dummy login for demo mode.
- Replace the English/Arabic toggle with a full locale dropdown.
- Add `product.json` and `tenant.json`.
- Allow config to be loaded from CDN / GitHub / object storage at runtime.
- Allow tenant-specific DirectLine endpoints.
- Allow tenant-specific WebChat / Adaptive Card visual configuration.
- Support tenant resolution by subdomain or path.
- Fallback to Greentic when tenant / product is unknown.

### Zain workshop behaviours to preserve in guided flows

The workshop repeatedly uses a common pattern:

1. parse request,
2. route to the right system,
3. retrieve data,
4. analyse / correlate,
5. present structured findings.

That pattern must drive the guided playbooks in WebChat.

## Repo audit checklist for Codex

Codex must inspect and document all of the following before coding:

### A. App shell and routing

- app entrypoint(s)
- router configuration
- any auth guard / protected route wrapper
- any theme provider / design-token provider
- any global config bootstrapping
- current handling of subdomain / path based routing

### B. Authentication

- current login page component(s)
- current auth state store / context
- username/password form logic
- local session handling
- any backend auth endpoints already present
- any existing OAuth / OIDC helper code

### C. Internationalisation

- current i18n library / implementation
- location of translation files
- current locale negotiation logic
- current language toggle component
- current RTL handling
- current fallback behaviour

### D. WebChat integration

- where Bot Framework WebChat is initialised
- DirectLine token/url acquisition flow
- current style options and theme overrides
- any custom middleware that could break standard behaviour
- current Adaptive Card host config or style injection
- any bot activity / routing wrappers

### E. Tenant / branding assumptions

- hardcoded product names
- hardcoded logos / colours / fonts
- hardcoded top navigation items
- hardcoded environment names or taglines
- places where `zain` or `telia` assumptions already exist

### F. Guided flow and menu implementation

- current playbook menus
- current Adaptive Card samples
- current natural-language-to-flow routing rules
- current dummy/demo data fixtures
- current "coming soon" route handling

### G. Static / remote config loading

- whether there is already a config loader
- where environment variables are read
- whether runtime JSON fetch on boot already exists
- CSP / CORS assumptions that would affect CDN-hosted config

### H. zain-network harvest

If `zain-network` is available locally to Codex, inventory:

- current shell/layout structure
- current header/footer/nav structure
- brand assets
- any language selector implementation
- any login page implementation
- any guided flow/menu structures
- any WebChat wrappers
- any reusable design tokens
- any runtime config patterns worth lifting over

If `zain-network` is not accessible, Codex must explicitly say so in the audit and proceed using only what is available from `greentic-webchat` plus the product requirements.

## Expected output files in this PR

- `docs/audit/current-state.md`
- `docs/audit/zain-network-intake.md`
- `docs/audit/microsoft-bot-framework-compatibility.md`
- `docs/audit/implementation-delta.md`
- `docs/audit/risk-register.md`
- `docs/audit/file-touch-map.md`

## Required sections in `implementation-delta.md`

1. **Auth delta**
   - remove username/password
   - add config-driven provider buttons
   - add dummy mode
   - add direct OIDC redirects
   - identify callback integration seam for `greentic-oauth`

2. **i18n delta**
   - move to locale dropdown
   - add full greentic-i18n locale registry
   - display locale names in native language
   - fallback `variant -> base -> en`
   - RTL for Arabic variants

3. **Branding / tenant delta**
   - introduce `product.json`
   - introduce `tenant.json`
   - support remote config loading
   - support tenant resolution by host/path
   - support Greentic default fallback

4. **WebChat delta**
   - preserve Microsoft Bot Framework
   - preserve standard Adaptive Cards
   - move DirectLine endpoint into tenant config
   - move WebChat / Adaptive Card host config into tenant config

5. **Guided flow delta**
   - category menu structure
   - guided playbooks
   - mocked data fixtures
   - standard Adaptive Card only

## Required acceptance criteria

- Audit is evidence-based and names the actual files/components currently responsible.
- Risk register identifies every place where WebChat compatibility could break.
- Implementation delta is broken into small PR-sized phases.
- No production behaviour changes are made in this PR.

## Exit condition

This PR is approved only when a reviewer can read the docs and know exactly:

- what exists today,
- what will change,
- in what order,
- what must remain untouched.
