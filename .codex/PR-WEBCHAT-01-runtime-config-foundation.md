# PR-WEBCHAT-01 — Add remote product/tenant/runtime configuration foundation

## Goal

Introduce a runtime configuration layer that lets `greentic-webchat` change product, tenant, branding, menus, DirectLine target, and Adaptive Card / WebChat appearance without rebuilding the frontend.

## Scope

This PR should add the config-loading foundation only. It should not yet force the whole UI to consume every new field.

## Deliverables

### 1. Runtime config loader

Add a config bootstrap layer that loads from a remote base URL.

Supported sources:

- CDN
- GitHub-hosted static JSON
- object storage (S3 / R2)

Priority:

1. `window.APP_CONFIG_BASE`
2. explicit environment override if the app framework supports one
3. fallback default URL

### 2. Product config

Load `product.json` from runtime config.

Expected fields:

- `product_url`
- `product_name_short` (i18n key)
- `product_name_long` (i18n key)
- `default_tenant`
- `default_language`

### 3. Tenant config

Load `tenants/<tenant>.json` from runtime config.

Expected fields:

- `tenant_id`
- branding
  - logo
  - colours
  - fonts
  - company name (i18n key)
  - tagline (i18n key)
- navigation
  - menu items
  - i18n labels
- webchat
  - `directline_url`
  - `adaptive_card_style`
  - any future host config / style options

### 4. Tenant resolution

Resolve tenant using:

1. subdomain (`zain.3aigent.com`)
2. path (`3aigent.com/zain`)
3. `product.default_tenant`

### 5. Fallback behaviour

If product URL is unknown or tenant config is missing, load the Greentic tenant.

## Suggested implementation structure

- `src/config/configLoader.*`
- `src/config/tenantResolver.*`
- `src/config/types.*`
- `src/context/runtimeConfigContext.*`

## Acceptance criteria

- App can boot with remote `product.json` and `tenant.json`.
- Tenant resolution works for host and path mode.
- Missing tenant falls back to Greentic.
- Existing app still boots if remote config is unavailable, using a safe fallback path if needed.
- No Bot Framework regressions.

## Out of scope

- replacing all hardcoded UI strings
- login redesign
- locale dropdown
- guided flow implementation
