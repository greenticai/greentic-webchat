# Risk Register

## High

### 1. WebChat boot regression during config migration

Files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/lib/directline.ts`
- `apps/webchat-spa/src/tenant.ts`

Risk:

- moving from direct `skin.json` boot to `product.json` + `tenant.json` can break tenant lookup, asset lookup, token fetch, or mount sequencing

Mitigation:

- keep existing `skin.json` path as a fallback through PR-03
- add boot smoke tests for two tenants

### 2. Breaking Bot Framework compatibility with custom guided UI

Files:

- future guided flow implementation
- existing safe seam in `apps/webchat-spa/src/bootstrap.ts`

Risk:

- copying `zain-network` custom `ChatContainer`/`AdaptiveCard` approach directly would bypass Bot Framework rendering

Mitigation:

- require standard Adaptive Card payloads only
- prohibit custom React chat renderer inside the SPA

### 3. Unsafe tenant hook growth

Files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/public/skins/*/webchat/hooks.js`

Risk:

- tenant hooks can mutate store/config and introduce undefined behavior across tenants

Mitigation:

- document supported hook API
- narrow hook responsibilities
- add smoke validation around middleware/hook tenants

### 4. Auth/OIDC shipped without a real callback seam

Risk:

- adding redirect-only OIDC buttons without a callback contract will produce demo flows that cannot evolve cleanly into real auth

Mitigation:

- define callback route/state storage contract in PR-02
- isolate redirect builder from session establishment

## Medium

### 5. Tenant resolution collisions with static hosting routes

Files:

- `apps/webchat-spa/src/tenant.ts`
- `apps/webchat-spa/public/js/tenant-resolver.js`

Risk:

- adding subdomain/path resolution on top of current GitHub Pages slug handling and `/embed` route can mis-resolve tenants

Mitigation:

- centralize tenant resolution
- add cases for:
  - localhost
  - GitHub Pages repo slug
  - `/tenant`
  - `/tenant/embed`
  - subdomain hostnames
  - reserved app routes

### 6. RTL only partially applied

Risk:

- shell may switch to RTL while full-page tenant HTML/CSS and chat container assumptions remain LTR

Mitigation:

- set document `dir` and `lang`
- test Arabic variant on widget and full-page modes

### 7. Remote config CORS/cache failures

Risk:

- config may be hosted on CDN/S3/GitHub and fail due to CORS or stale cache behavior

Mitigation:

- keep fetches `no-store` where appropriate
- define failure fallback path
- document hosting requirements

### 8. Branding system split-brain between shell config and skin config

Risk:

- shell branding could move to `tenant.json` while WebChat branding still comes from `skin.json`, causing tenant drift

Mitigation:

- add an explicit adapter layer
- declare source-of-truth fields per phase

### 9. Substantial shell rewrite before validation coverage exists

Risk:

- auth + i18n + branding + routing changes are cross-cutting and currently untested

Mitigation:

- add tests as each phase lands
- use ChatGPT validation gate before and after major changes

## Low

### 10. Existing docs and generated `site/` copies drift from source

Risk:

- there are duplicate docs/assets under `docs/` and `site/`

Mitigation:

- keep audit focused on source-of-truth app files
- document which generated/static copies are secondary

## Required test additions

- tenant resolver unit tests
- config loader tests with fallback behavior
- Direct Line config adapter tests
- auth provider URL builder tests
- locale fallback and RTL tests
- smoke render tests for WebChat boot

## Release recommendation

Do not combine PR-01, PR-02, and PR-03 into one change. The current app is simple enough that each additional cross-cutting concern multiplies regression risk if staged poorly.
