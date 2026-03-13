# ChatGPT validation prompt — review greentic-webchat migration plan / implementation

Validate the following migration for `greentic-webchat`.

## Context

This app must be migrated to support:

- remote `product.json` + `tenant.json`
- tenant resolution by subdomain or path
- Greentic fallback tenant
- config-driven login buttons
- dummy login
- real OIDC redirects
- large locale dropdown with native names
- browser language used as the initial default locale before any user override
- locale fallback `variant -> base -> en`
- RTL for Arabic variants
- tenant-driven navigation
- tenant-driven DirectLine backend
- tenant-driven WebChat / Adaptive Card visual config
- guided telecom playbooks in standard Adaptive Cards
- preservation of Microsoft Bot Framework WebChat compatibility

## Inputs

### 1. Current-state audit

`greentic-webchat` is currently a lightweight React/Vite shell around Microsoft Bot Framework WebChat. It already supports tenant-specific skins, runtime skin JSON loading, tenant-specific Direct Line token URLs, tenant-specific WebChat style options, Adaptive Card host config, optional per-tenant hook modules, and path/query-based tenant resolution.

It does not currently implement:

- app routing beyond tenant path parsing
- login pages or auth guards
- OIDC or OAuth callback handling
- app-wide i18n infrastructure
- locale selection UI
- RTL switching
- product-level runtime config (`product.json`)
- tenant resolution by subdomain
- fallback to a named Greentic tenant
- guided playbook menus inside the React SPA

Concrete file ownership from the current repo:

- App entrypoint: `apps/webchat-spa/index.html`, `apps/webchat-spa/src/main.tsx`
- Runtime bootstrap: `apps/webchat-spa/src/bootstrap.ts`
- Tenant resolution: `apps/webchat-spa/src/tenant.ts`, `apps/webchat-spa/public/js/tenant-resolver.js`
- Direct Line config/token acquisition: `apps/webchat-spa/src/lib/directline.ts`
- WebChat connection/token status: `apps/webchat-spa/src/state/connection.ts`, `apps/webchat-spa/src/state/token.ts`
- Shared skin typing/schema: `apps/webchat-spa/src/types.ts`, `apps/webchat-spa/shared/skin-schema.mjs`

Important current constraints:

- no React router is present
- no auth system exists
- no i18n library exists
- no custom activity renderer was found
- WebChat currently stays on standard `createDirectLine` + `renderWebChat`
- current fallback tenant is `_template`, not Greentic

### 2. legacy-donor-app intake notes

Local repo `../legacy-donor-app` is available and was inspected directly.

Useful donor patterns found there:

- runtime config loader for `product.json` and `tenants/<tenant>.json`
- tenant resolution by subdomain or path
- Greentic fallback tenant
- config-driven login provider buttons
- `dummy` and `oidc` provider models
- i18next setup with locale persistence and `variant -> base -> en` fallback
- large locale registry with native names and RTL helpers
- tenant-driven header navigation
- guided telecom playbook taxonomy, menu hierarchy, NL routing, and sample fixture data

Key files:

- `../legacy-donor-app/src/lib/configLoader.ts`
- `../legacy-donor-app/src/lib/tenantResolver.ts`
- `../legacy-donor-app/src/contexts/ConfigContext.tsx`
- `../legacy-donor-app/src/contexts/AuthContext.tsx`
- `../legacy-donor-app/src/pages/Login.tsx`
- `../legacy-donor-app/src/i18n/index.ts`
- `../legacy-donor-app/src/i18n/locales.ts`
- `../legacy-donor-app/src/components/LanguageSelector.tsx`
- `../legacy-donor-app/src/components/TenantHeader.tsx`
- `../legacy-donor-app/src/components/ChatContainer.tsx`
- `../legacy-donor-app/src/data/flowData.ts`

Important limitation:

- `legacy-donor-app` uses a custom chat UI and custom card rendering, so it should not be copied directly into `greentic-webchat` for in-chat rendering.

### 3. File touch map

Planned file touch areas by stage:

PR-01 runtime config foundation:

- likely add `apps/webchat-spa/src/config/configLoader.ts`
- likely add `apps/webchat-spa/src/config/tenantResolver.ts`
- likely add `apps/webchat-spa/src/config/types.ts`
- likely add `apps/webchat-spa/src/context/runtimeConfigContext.tsx`
- likely modify `apps/webchat-spa/src/bootstrap.ts`
- likely modify `apps/webchat-spa/src/main.tsx`
- likely modify `apps/webchat-spa/src/tenant.ts` and `apps/webchat-spa/public/js/tenant-resolver.js`

PR-02 auth + i18n + shell branding/navigation:

- likely add `apps/webchat-spa/src/auth/AuthContext.tsx`
- likely add `apps/webchat-spa/src/auth/oidc.ts`
- likely add `apps/webchat-spa/src/i18n/index.ts`
- likely add `apps/webchat-spa/src/i18n/locales.ts`
- likely add `apps/webchat-spa/src/components/LanguageSelector.tsx`
- likely add `apps/webchat-spa/src/components/LoginPage.tsx`
- likely modify `apps/webchat-spa/src/main.tsx`, `apps/webchat-spa/src/style.css`, and config context/types

PR-03 WebChat branding + Direct Line tenant mapping:

- likely add `apps/webchat-spa/src/webchat/tenantWebChatAdapter.ts`
- likely modify `apps/webchat-spa/src/bootstrap.ts`
- likely modify `apps/webchat-spa/src/lib/directline.ts`
- likely keep legacy `skin.json` bridge during transition

PR-04 guided Adaptive Card playbooks:

- likely add `apps/webchat-spa/src/playbooks/catalog.ts`
- likely add `apps/webchat-spa/src/playbooks/fixtures.ts`
- likely add `apps/webchat-spa/src/playbooks/adaptiveCards.ts`
- likely add `apps/webchat-spa/src/playbooks/nlRouting.ts`

High-risk files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/lib/directline.ts`
- `apps/webchat-spa/src/tenant.ts`
- `apps/webchat-spa/public/js/tenant-resolver.js`

### 4. Implementation delta

Migration summary:

- this is not a greenfield WebChat app
- `greentic-webchat` already has tenant-skinned WebChat foundations
- the migration should extend the current platform rather than replace it with the `legacy-donor-app` architecture wholesale

Auth delta:

- current state: no login page, no auth state, no OIDC helper
- add config-driven provider buttons
- add `dummy` demo login
- add direct OIDC redirects
- define callback seam for future `greentic-oauth` integration

i18n delta:

- current state: only `skin.webchat.locale`
- add full locale dropdown
- use browser language as the initial default locale when no explicit user choice is stored
- persist explicit user choice
- fallback `variant -> base -> en`
- switch document to RTL for Arabic variants

Branding / tenant delta:

- current state: `skin.json` only, path/query/data-attribute tenant resolution, fallback `_template`
- add `product.json`
- add `tenant.json`
- add remote config loading base
- add subdomain/path/default tenant resolution
- add Greentic fallback

WebChat delta:

- current state already supports tenant-specific token URL, style options, host config, hooks
- move those capabilities under higher-level tenant config
- preserve Microsoft Bot Framework
- preserve standard Adaptive Cards
- use a tenant-to-WebChat adapter rather than a broad rewrite

Guided flow delta:

- current state has no guided flows
- add category menu, playbook metadata, fixtures, NL trigger routing
- generate standard Adaptive Card payloads only
- do not implement custom React chat cards

Key sequencing decision:

- keep `skin.json` as a bridge in early phases instead of deleting it immediately

Locale default rule currently proposed for validation:

- `persisted user choice -> explicit tenant/product default if required -> browser locale -> base language -> en`

Open validation question:

- should browser locale outrank tenant/product defaults in all cases?

### 5. Risk register

Top current risks identified before coding:

1. WebChat boot regression during config migration
2. breaking Bot Framework compatibility by copying custom guided UI from `legacy-donor-app`
3. tenant hook growth causing unsupported WebChat behavior
4. adding OIDC redirects without a real callback/session seam
5. tenant resolution collisions across GitHub Pages, localhost, `/tenant`, `/tenant/embed`, and future reserved routes
6. partial RTL support in shell or full-page tenant HTML/CSS
7. remote config CORS/cache failures for CDN/object storage/GitHub-hosted JSON
8. branding split-brain between future `tenant.json` and legacy `skin.json`
9. broad shell rewrite before validation coverage exists
10. doc/static mirror drift between source and generated copies

Missing tests currently identified:

- tenant resolver unit tests
- config loader fallback tests
- Direct Line config adapter tests
- auth provider URL builder tests
- locale fallback and RTL tests
- WebChat smoke render tests

### 6. Staged PR plan

1. PR-00 audit docs only
2. PR-01 runtime config foundation
3. PR-02 auth, locale selector, shell branding/navigation
4. PR-03 WebChat tenant mapping and Direct Line config migration
5. PR-04 guided Adaptive Card playbooks
6. PR-05 validation gate/docs

### 7. Pre-change-only note

This is a pre-change validation pass. No implementation changes beyond audit docs are included yet.

## What to validate

Please review and answer these questions:

1. Is the migration sequence safe, or should the order change?
2. What Microsoft Bot Framework / Adaptive Card compatibility risks remain?
3. What auth/OIDC edge cases are likely to be missed?
4. What i18n/locale/RTL pitfalls remain?
5. What tenant-resolution or remote-config pitfalls remain?
6. What tests are missing?
7. What rollback / fallback behaviour is missing?
8. Which parts are too coupled and should be split further?
9. Are any requirements from the workshop-style guided playbooks missing?
10. Is there any place where the plan accidentally hardcodes product/tenant assumptions instead of loading from config?
11. Does the locale plan correctly use the browser language as the initial default while still allowing explicit user persistence/override?

## Required output format

Return:

### A. Overall verdict
- green / amber / red

### B. Top 10 risks

### C. Recommended changes before implementation/merge

### D. Test checklist

### E. Compatibility checklist specific to Microsoft Bot Framework

### F. Any missing requirement you believe should be added now rather than later
