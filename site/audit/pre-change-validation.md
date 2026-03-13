# Pre-Change Validation Brief

Use this document with `.codex/CHATGPT-VALIDATION-PROMPT.md` for the required pre-change validation pass.

## Staged PR plan

1. PR-00 audit docs only
2. PR-01 runtime config foundation
3. PR-02 auth, locale selector, shell branding/navigation
4. PR-03 WebChat tenant mapping and Direct Line config migration
5. PR-04 guided Adaptive Card playbooks
6. PR-05 validation gate/docs

## Current-state audit

Source:

- `docs/audit/current-state.md`

Summary:

- `greentic-webchat` is currently a React/Vite wrapper around Microsoft Bot Framework WebChat.
- Tenant behavior is driven by `public/skins/{tenant}/skin.json`, not `product.json` plus `tenant.json`.
- Tenant resolution currently supports query, data attribute, and path-based resolution, but not subdomain resolution.
- There is no auth system, no login page, no i18n framework, no locale selector, no RTL handling, and no guided playbook UI in the current SPA.
- WebChat compatibility is currently strong because the integration is thin: CDN WebChat load, `createDirectLine`, `renderWebChat`, tenant style options, tenant host config, and optional tenant hook middleware.

## legacy-donor-app intake notes

Source:

- `docs/audit/legacy-donor-intake.md`

Summary:

- `legacy-donor-app` already implements runtime config loading, tenant resolution by subdomain/path, config-driven login providers, i18n, locale persistence, RTL, tenant navigation, and guided telecom playbook flows.
- Its chat UX is custom-rendered and should not be copied directly into `greentic-webchat`.
- It is a donor for config/auth/i18n/playbook concepts, not for the WebChat rendering layer.

## File touch map

Source:

- `docs/audit/file-touch-map.md`

Summary:

- PR-01 likely introduces config loader, tenant resolver, config types, and a runtime config context.
- PR-02 likely introduces auth, OIDC redirect helpers, i18n bootstrap, locale registry, language selector, and login page UI.
- PR-03 likely introduces a tenant-to-WebChat adapter and updates Direct Line/WebChat mapping while preserving legacy `skin.json` fallback.
- PR-04 likely introduces playbook catalog, fixtures, NL routing, and Adaptive Card generation.

## Implementation delta

Source:

- `docs/audit/implementation-delta.md`

Summary:

- The migration should extend an existing WebChat platform, not replace it.
- `skin.json` should remain as a bridge during early phases.
- Browser language should be used as the initial default locale when no user preference exists, with explicit user persistence overriding later.
- Guided playbooks must be implemented as standard Adaptive Cards, not custom React chat cards.

## Risk register

Source:

- `docs/audit/risk-register.md`

Summary:

- Highest risks are WebChat boot regressions during config migration, accidental loss of Bot Framework compatibility, unbounded tenant hook behavior, and adding OIDC redirects without a clear callback seam.
- Medium risks include tenant resolution edge cases, partial RTL support, remote config CORS/cache issues, and branding drift between `tenant.json` and `skin.json`.

## Questions to emphasize in validation

- Is browser-locale-first defaulting the right rule, or should tenant/product defaults outrank browser locale in some deployments?
- Is the `skin.json` bridge plan sufficient, or should WebChat config migration be pulled earlier?
- What additional Bot Framework-specific smoke checks should be mandatory before PR-03 and PR-04 merge?
- What callback/session contract should be fixed now so OIDC provider buttons do not become dead-end demo behavior?

## Required Codex proof points before broad implementation

Runtime config:

- `product.json` and `tenant.json` can load without breaking existing skins
- unknown tenant falls back safely
- subdomain and path resolution are deterministic

WebChat safety:

- official Microsoft WebChat still loads
- Direct Line still works
- `styleOptions` and host config still map correctly
- no custom chat renderer was introduced

Future auth seam:

- login page can be added without coupling to WebChat boot
- OIDC provider redirect builder is isolated
- callback seam is defined even if not fully implemented

i18n seam:

- browser locale can be used as the initial default
- persisted user choice overrides later
- RTL can be applied without breaking the shell

## Required reporting format for each implemented PR

For each PR, Codex should return:

1. Files changed
2. What changed and why
3. Diff-risk notes
4. Validation evidence
5. Screens / behavior proof
6. Explicit compatibility statement
7. Known gaps

## Recommended execution sequence

Immediate next step:

- validate the audit
- generate the ChatGPT validation prompt payload
- implement PR-01 only

Do not start:

- PR-02 yet
- PR-03 yet
- guided playbooks yet

## Important boundary

Do not copy `legacy-donor-app` UI patterns into the chat rendering layer.

- shell concepts are reusable
- chat rendering approach is not
