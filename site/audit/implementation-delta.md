# Implementation Delta

## Summary

The requested migration is additive on top of an existing skin-based Bot Framework wrapper. The main delta is not “make WebChat tenant-aware” because that already exists in basic form. The real delta is:

- introduce a higher-level product/tenant runtime config layer
- add app-shell auth and i18n
- generalize tenant resolution and fallback
- preserve the existing standard WebChat integration while widening tenant control
- add guided flows without replacing Bot Framework rendering

## Proposed PR sequence

1. PR-00 audit docs only
2. PR-01 runtime config foundation
3. PR-02 auth, locale selector, shell branding/navigation
4. PR-03 WebChat tenant mapping and Direct Line config migration
5. PR-04 guided Adaptive Card playbooks
6. PR-05 validation gate/docs

## 1. Auth delta

Current state:

- no login page
- no auth state
- no username/password form
- no OIDC helper

Requested change:

- add config-driven provider buttons
- support `dummy` provider for demo mode
- support direct OIDC redirects
- identify callback seam for future `greentic-oauth` integration

Reference source:

- `../legacy-donor-app/src/pages/Login.tsx`
- `../legacy-donor-app/src/contexts/AuthContext.tsx`
- `../legacy-donor-app/public/config/tenants/*.json`

Recommended implementation split:

- PR-02A
  - add auth context/session model
  - add login route/page
  - add dummy login only
- PR-02B
  - add config-driven OIDC provider buttons
  - add state generation/storage
  - add redirect builder
  - define callback placeholder/integration seam

Callback seam to define now:

- route or function boundary where an eventual `greentic-oauth` package can validate `state`, exchange code, and persist session without rewriting the login page

## 2. i18n delta

Current state:

- no app i18n library
- only `skin.webchat.locale`
- no selector
- no RTL

Requested change:

- full locale dropdown
- browser language used as the initial default locale before any user override
- locale names in native language
- locale persistence
- translation loading from `/i18n/{locale}.json`
- fallback `variant -> base -> en`
- RTL for Arabic variants

Reference source:

- `../legacy-donor-app/src/i18n/index.ts`
- `../legacy-donor-app/src/i18n/locales.ts`
- `../legacy-donor-app/src/components/LanguageSelector.tsx`

Recommended implementation split:

- PR-02A
  - add locale registry and helpers
  - add i18n bootstrap with fallback chain
  - detect initial locale from the browser when no user preference is stored
  - add shell translations for current SPA strings
- PR-02B
  - add locale dropdown
  - persist selected locale
  - set document `lang`/`dir`
  - pass resolved locale into WebChat config

Default locale rule:

- precedence should be `persisted user choice -> explicit tenant/product default if required for a given deployment -> browser locale -> base language -> en`
- if product requirements prefer browser-first over config defaults for general consumer traffic, validate that ordering before implementation

## 3. Branding / tenant delta

Current state:

- `skin.json` is the only runtime tenant config
- tenant resolution is query/data-attribute/path based
- fallback tenant is `_template`
- no product-level config

Requested change:

- introduce `product.json`
- introduce `tenant.json`
- support remote config loading
- support tenant resolution by host or path
- support Greentic default fallback

Reference source:

- `../legacy-donor-app/src/lib/configLoader.ts`
- `../legacy-donor-app/src/lib/tenantResolver.ts`
- `../legacy-donor-app/src/contexts/ConfigContext.tsx`

Recommended implementation split:

- PR-01A
  - add config types and loader for `product.json` + `tenants/<id>.json`
  - support `window.APP_CONFIG_BASE`
  - preserve existing runtime base behavior
- PR-01B
  - add tenant resolver that combines subdomain + path + default tenant
  - keep GitHub Pages repo slug handling
  - define Greentic fallback
- PR-01C
  - bridge `tenant.json` to existing `skin.json` consumption rather than replacing everything immediately

Key migration decision:

- do not delete `skin.json` in the early phases
- instead map higher-level tenant config to current skin/WebChat needs until PR-03 can complete the chat-specific migration

## 4. WebChat delta

Current state:

- tenant-specific Direct Line token URL already exists in `skin.json`
- tenant-specific WebChat style options already exist
- tenant-specific Adaptive Card host config already exists
- optional tenant hooks already exist

Requested change:

- preserve Microsoft Bot Framework
- preserve standard Adaptive Cards
- move Direct Line endpoint into tenant config
- move WebChat/Adaptive Card config into tenant config

Reference source:

- existing `greentic-webchat` bootstrap and skin assets
- `../legacy-donor-app/public/config/tenants/*.json` only for config shape inspiration

Recommended implementation split:

- PR-03A
  - add tenant-to-WebChat mapping adapter
  - support tenant config fields for Direct Line and WebChat visuals
- PR-03B
  - keep legacy `skin.json` fallback while tenant config adoption completes
  - add smoke coverage for at least Greentic + one non-default tenant
- PR-03C
  - document supported hooks and unsupported chat customizations

Important note:

- this is an evolution of an existing capability, not a greenfield feature

## 5. Guided flow delta

Current state:

- no guided flows in `greentic-webchat`

Requested change:

- category menu structure
- guided playbooks
- mocked data fixtures
- standard Adaptive Cards only

Reference source:

- `../legacy-donor-app/src/components/ChatContainer.tsx`
- `../legacy-donor-app/src/data/flowData.ts`

Recommended implementation split:

- PR-04A
  - define playbook metadata, fixtures, and NL trigger map
- PR-04B
  - generate standard Adaptive Card payloads from those definitions
- PR-04C
  - integrate with bot-compatible entry points without custom React chat rendering

Critical boundary:

- `legacy-donor-app` menu/card UX is a product reference only
- implementation in `greentic-webchat` must surface through bot-compatible Adaptive Cards rather than custom chat message components

## Bottom line

The migration is safest if it treats `greentic-webchat` as an existing WebChat platform with missing shell features, not as an empty app to be rebuilt in the image of `legacy-donor-app`.
