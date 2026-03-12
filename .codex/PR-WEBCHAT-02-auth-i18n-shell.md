# PR-WEBCHAT-02 — Replace login + locale toggle, wire shell branding/navigation to tenant config

## Goal

Move the app shell from hardcoded brand/auth/locale assumptions to runtime-configured behaviour.

## Scope

### A. Login page

Replace username/password with config-driven provider buttons.

Provider types:

- `dummy` — local demo session
- `oidc` — direct redirect to the provider authorization endpoint

Use runtime config, not hardcoded buttons.

Expected provider fields:

- `id`
- `label` (i18n key or literal)
- `type`
- `enabled`
- for OIDC:
  - `authorizationUrl`
  - `clientId`
  - `redirectUri`
  - `scope`
  - `responseType`
  - optional `audience`
  - optional `prompt`

### B. OIDC behaviour

On click for OIDC provider:

1. generate state
2. store state locally
3. build real authorization URL
4. redirect to external provider login page

Do not redirect to fake local placeholder routes.

### C. Locale selector

Replace the Arabic/English toggle with a full locale dropdown using the greentic-i18n list.

Requirements:

- display locale names in their native language
- persist selection
- load `/i18n/{locale}.json`
- fallback `variant -> base -> en`
- RTL for Arabic variants

### D. Shell branding and menu

Move visible shell identity to tenant config:

- logos
- colours
- fonts
- company name
- tagline
- top navigation links (Admin / Store / Playbook Designer etc.)

All labels must be i18n-friendly.

## Acceptance criteria

- Login page no longer contains username/password.
- Dummy login enters the app.
- OIDC buttons redirect to real external provider authorization pages.
- Header locale selector supports the supplied locale registry.
- Locale labels render in native language.
- Arabic variants switch app into RTL.
- Shell branding/menu comes from tenant config.
- Existing WebChat still loads.
