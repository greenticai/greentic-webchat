# Runtime Config

This document describes the PR-01 runtime-config foundation and its current bridge relationship with legacy tenant `skin.json` files.

## Scope

PR-01 adds:

- `product.json` runtime loading
- `tenant.json` runtime loading
- configurable runtime config base
- deterministic tenant resolution
- Greentic fallback at the config layer
- a bridge back to the existing `skins/{tenant}/skin.json` boot path

PR-01 does not yet add:

- auth/login
- i18n UI
- locale selector
- RTL switching
- shell branding/navigation consumption from tenant config
- Direct Line migration out of the legacy skin path
- guided playbooks

## Config base priority

Runtime config base resolves in this order:

1. `window.APP_CONFIG_BASE`
2. `import.meta.env.VITE_APP_CONFIG_BASE`
3. `BASE_PATH + "config"`

Examples:

- local dev: `/config`
- GitHub Pages: `/greentic-webchat/config`
- explicit remote override: `https://cdn.example.com/webchat-config`

## Tenant resolution priority

Tenant resolution now follows this order:

1. query override `?tenant=...`
2. explicit pre-set global `window.__TENANT__`
3. `<html data-tenant="...">`
4. subdomain tenant
5. first path segment tenant
6. product default tenant
7. hard fallback `greentic`

Notes:

- GitHub Pages repo slug handling is preserved, so `/greentic-webchat/cisco/embed` resolves tenant `cisco`.
- Embed semantics are preserved, so `/tenant/embed` and `/embed` continue to resolve widget mode correctly.
- Reserved non-tenant path segments such as `embed`, `login`, `auth`, `admin`, `store`, and `playbooks` are excluded from path-tenant resolution.

## Effective fallback order

PR-01 keeps legacy `skin.json` as the live boot source for WebChat.

Effective runtime flow:

1. resolve requested tenant
2. load `product.json` if available
3. determine default tenant from `product.default_tenant`, else `greentic`
4. load requested `tenant.json` if available
5. load fallback tenant config for Greentic/default tenant if needed
6. derive ordered legacy skin candidates
7. boot the first legacy skin that exists

In practice, the legacy skin candidate order is:

1. requested tenant config `legacy_skin` if defined
2. requested tenant name
3. fallback tenant config `legacy_skin` if defined
4. hard fallback `_template`

For an unknown tenant with no `tenant.json`, that currently becomes:

1. unknown tenant legacy skin name
2. Greentic legacy skin fallback, currently `_template`

This means the app still boots legacy skins first and only uses runtime config as a selection and fallback layer in PR-01.

## Relationship between `tenant.json` and `skin.json`

Current relationship:

- `tenant.json` is the new runtime-config source
- `skin.json` remains the active WebChat boot source

PR-01 bridge behavior:

- `tenant.json` determines tenant/default/fallback resolution
- `tenant.json` may point to a legacy skin via `legacy_skin`
- once a skin candidate is chosen, existing `skin.json` loading continues unchanged
- Direct Line token URL, WebChat style options, Adaptive Card host config, and hook loading still come from the legacy skin path

This is intentional. It keeps PR-01 additive and reversible while avoiding Direct Line or WebChat render churn.

## Path behavior by environment

Local dev:

- app base is `/`
- default runtime config base is `/config`
- legacy skins still resolve from `/skins/...`

Static hosting:

- config files are emitted into `dist/config/...`
- legacy skins remain under `dist/skins/...`

GitHub Pages:

- app base is `/greentic-webchat/`
- default runtime config base becomes `/greentic-webchat/config`
- tenant path resolution still strips the repo slug before evaluating tenant segments

## Bootstrap alignment

`runtimeBootstrap.ts` exists to set pre-app globals consistently before the React app starts.

It does not replace app bootstrap.

Current responsibilities:

- set `window.__BASE_PATH__`
- set `window.__TENANT__` only when resolution comes from a non-default explicit source
- keep `window.__loadSkin__` available as a legacy helper

Why this does not drift:

- both pre-bootstrap and app bootstrap use the same shared runtime-config resolver logic
- app bootstrap still performs authoritative runtime bridge loading before WebChat boot
- pre-bootstrap does not fetch runtime config JSON or render WebChat

Why this does not race:

- pre-bootstrap runs first only to establish stable globals
- React app bootstrap still performs all async runtime-config and skin selection work itself
- there is no competing async boot path for WebChat render
