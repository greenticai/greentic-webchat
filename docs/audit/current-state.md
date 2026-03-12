# Current State Audit

## Scope inspected

- `greentic-webchat`
- local `../zain-network`
- `.codex/PR-WEBCHAT-00-audit.md` through `.codex/PR-WEBCHAT-05-validation-gate.md`

## Executive summary

`greentic-webchat` is currently a lightweight React/Vite shell around Microsoft Bot Framework WebChat. It already supports tenant-specific skins, runtime skin JSON loading, tenant-specific Direct Line token URLs, tenant-specific WebChat style options, Adaptive Card host config, optional per-tenant hook modules, and path/query-based tenant resolution.

It does **not** currently implement:

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

`zain-network` contains working reference implementations for most of those missing concerns, but its chat surface is a custom UI that renders its own card-like components rather than Microsoft Bot Framework WebChat.

## A. App shell and routing

### Entrypoints

- `apps/webchat-spa/index.html`
  - injects `/js/tenant-resolver.js`
  - mounts `src/main.tsx`
- `apps/webchat-spa/src/main.tsx`
  - owns the entire SPA render lifecycle
  - loads one `PreparedExperience`
  - mounts WebChat into `#webchat`
  - renders either widget mode or tenant-provided full-page shell HTML

### Router configuration

No React router exists in `greentic-webchat`.

- There is no `react-router-dom` dependency in `apps/webchat-spa/package.json`.
- Route handling is implicit through URL path parsing in `apps/webchat-spa/src/tenant.ts`.
- Deep-link fallback is handled at static hosting level via copied `404.html`, documented in `README.md` and `docs/pages.md`.

### Auth guard / protected route wrapper

None in `greentic-webchat`.

### Theme provider / design token provider

No React theme provider exists.

- `apps/webchat-spa/src/bootstrap.ts` applies branding directly to the document:
  - updates `document.title`
  - sets `--brand-primary`
  - swaps favicon
  - injects tenant-specific full-page CSS
- `apps/webchat-spa/src/style.css` provides the shared widget/full-page shell styles.

### Global config bootstrapping

Current runtime bootstrap is skin-based, not product/tenant-config based.

- `apps/webchat-spa/public/js/tenant-resolver.js`
  - sets `window.__TENANT__`
  - sets `window.__BASE_PATH__`
  - exposes `window.__loadSkin__()`
- `apps/webchat-spa/src/bootstrap.ts`
  - resolves tenant
  - fetches `skins/{tenant}/skin.json`
  - loads WebChat CDN, Direct Line token, style options, host config, hooks, and full-page shell

### Current handling of subdomain / path routing

- `apps/webchat-spa/src/tenant.ts`
  - supports path segment resolution
  - supports embed mode via second path segment `embed`
  - strips GitHub Pages repo slug when hosted on `github.io`
- `apps/webchat-spa/public/js/tenant-resolver.js`
  - supports query `?tenant=...`
  - supports `<html data-tenant>`
  - supports first path segment
  - does **not** support tenant resolution by subdomain

## B. Authentication

No authentication flow exists in `greentic-webchat`.

- No login page component
- No auth state context/store
- No username/password form
- No local session handling
- No backend auth endpoints in this repo
- No existing OAuth/OIDC helper code

This is a full greenfield addition for `greentic-webchat`.

## C. Internationalisation

`greentic-webchat` currently has only per-skin locale passthrough into Bot Framework WebChat.

- `apps/webchat-spa/shared/skin-schema.mjs`
  - requires `webchat.locale`
- `apps/webchat-spa/src/bootstrap.ts`
  - passes `skin.webchat.locale ?? 'en-US'` into `renderWebChat`
- `apps/webchat-spa/src/main.tsx`
  - displays the raw locale string in widget mode

Missing today:

- i18n library
- translation files for app shell
- browser-driven locale negotiation
- locale switcher
- persistence for locale selection
- RTL document handling
- locale fallback logic beyond whatever the bot itself does

## D. WebChat integration

### Initialization

- `apps/webchat-spa/src/bootstrap.ts`
  - loads Bot Framework WebChat from `https://cdn.botframework.com/botframework-webchat/latest/webchat.js`
  - creates Direct Line client
  - builds `WebChatConfig`
  - optionally creates store with tenant hook middleware
  - renders WebChat

### Direct Line token / URL acquisition flow

- `apps/webchat-spa/src/lib/directline.ts`
  - POSTs to `skin.directLine.tokenUrl`
  - supports `?directline=` override
  - if override looks like a Direct Line domain, still fetches token from skin token URL and swaps domain only
  - tracks fetch state via `apps/webchat-spa/src/state/token.ts`

### Style options and theme overrides

- `apps/webchat-spa/src/bootstrap.ts`
  - fetches `skin.webchat.styleOptions`
  - fetches `skin.webchat.adaptiveCardsHostConfig`
- tenant JSON examples under `apps/webchat-spa/public/skins/*/webchat/*.json`

### Custom middleware / hooks

- `apps/webchat-spa/src/bootstrap.ts`
  - dynamically imports optional tenant `hooks.js`
  - accepts `createStoreMiddleware`
  - accepts `onBeforeRender`
- examples:
  - `apps/webchat-spa/public/skins/_template/webchat/hooks.js`
  - `apps/webchat-spa/public/skins/customera/webchat/hooks.js`
  - `apps/webchat-spa/public/skins/customerb/webchat/hooks.js`

These hooks are the main compatibility seam that could drift outside safe Bot Framework boundaries.

### Adaptive Card host config / style injection

- Host config is loaded as JSON from each tenant skin and passed to WebChat through `adaptiveCardsHostConfig`.
- No custom Adaptive Card renderer is present in `greentic-webchat`.

### Bot activity / routing wrappers

- No custom activity renderer was found in the SPA source.
- No custom chat protocol was found.
- Current integration stays on standard `createDirectLine` + `renderWebChat`.

## E. Tenant / branding assumptions

Current product model is tenant skin, not separate product + tenant.

Hardcoded assumptions include:

- title format `"{brand.name} · WebChat"` in `apps/webchat-spa/src/bootstrap.ts`
- fallback tenant `_template` in:
  - `apps/webchat-spa/src/tenant.ts`
  - `apps/webchat-spa/public/js/tenant-resolver.js`
- widget shell copy in `apps/webchat-spa/src/main.tsx`
  - `"Loading tenant experience…"`
  - `"Something went wrong"`
  - `"Check the browser console for more details."`
  - `"Locale:"`
- root app title `"Greentic WebChat"` in `apps/webchat-spa/index.html`

There are no current `zain` or `telia` assumptions in the React SPA source. Those references only appear in docs/examples such as `docs/skins/zain-kuwait.json` and `docs/zain-kuwait/index.html`.

## F. Guided flow and menu implementation

No guided playbook UI exists in `greentic-webchat` today.

- No playbook menu components
- No natural-language-to-flow router
- No demo fixtures for guided telecom flows
- No "coming soon" route handling

The current product is a generic tenant-skinned WebChat wrapper.

## G. Static / remote config loading

Current config loading exists only for tenant skin files and related assets.

- `apps/webchat-spa/public/js/tenant-resolver.js`
  - computes runtime base path
- `apps/webchat-spa/src/bootstrap.ts`
  - resolves all asset URLs relative to runtime base
  - fetches skin JSON and related WebChat resources with `cache: 'no-store'`

There is **not** yet:

- `product.json`
- `tenants/<tenant>.json`
- remote config base override priority using `window.APP_CONFIG_BASE`
- explicit environment override for config base

### Environment variables

- Vite environment usage is limited to `import.meta.env.BASE_URL` in `apps/webchat-spa/src/bootstrap.ts`.

### Runtime JSON fetch on boot

Yes, but only for skin assets:

- `skins/{tenant}/skin.json`
- style options
- Adaptive Card host config
- optional hooks
- full-page shell HTML

### CSP / CORS assumptions

Likely relevant assumptions:

- WebChat script is loaded from the Microsoft CDN at runtime.
- Direct Line token endpoints are cross-origin `https://demo.greentic.ai/...`.
- full-page shell HTML and hooks are fetched dynamically.
- remote config from CDN/object storage will need the same fetch/CORS discipline.

## H. Current testing and validation coverage

Observed validation today:

- root build runs `npm run validate:skins`
- `scripts/validate-skins.mjs` validates tenant skin assets/schema
- `apps/webchat-spa/package.json` includes `typecheck`
- `ci/local_check.sh` is documented in `README.md`

Observed gaps:

- no unit tests in `greentic-webchat`
- no integration tests around WebChat boot
- no auth tests
- no i18n/RTL tests
- no tenant resolution tests

## Bottom line

`greentic-webchat` already has a strong tenant skin foundation for WebChat-specific configuration, but almost all of the planned work outside WebChat itself is new surface area. The lowest-risk path is:

1. preserve the existing `skin.json` boot path initially
2. add product/tenant config beside it
3. migrate shell/auth/i18n concerns first
4. keep WebChat on the existing standard integration seam
5. only then layer guided playbooks on top
