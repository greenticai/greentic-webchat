# Legacy Donor Intake

## Availability

Local repo found at `../legacy-donor-app` and inspected directly.

## Executive summary

`legacy-donor-app` is a separate React app that already implements most of the requested non-WebChat migration concepts:

- runtime `product.json` and `tenant.json` loading
- tenant resolution by subdomain or path
- Greentic fallback tenant
- config-driven auth provider buttons with `dummy` and `oidc` options
- i18next-based locale loading with persisted selection and variant fallback
- RTL switching
- header/navigation driven by tenant config
- guided telecom playbook menus and demo fixture data

The main thing it does **not** preserve is Bot Framework WebChat. Its chat experience is custom-rendered.

## Useful assets and patterns to harvest

## 1. App shell and routing

- `../legacy-donor-app/src/App.tsx`
  - uses `BrowserRouter`
  - has `/login`, `/`, and catch-all routes
  - wraps `/` in `ProtectedRoute`
- `../legacy-donor-app/src/pages/Index.tsx`
  - updates document `dir` and `lang` from current locale

Reusable idea:

- protected shell split between login and authenticated app

Non-reusable as-is:

- full routing model assumes a normal SPA app, not a static tenant-path WebChat site

## 2. Runtime config loading

- `../legacy-donor-app/src/lib/configLoader.ts`
  - loads from `window.APP_CONFIG_BASE || "/config"`
  - defines `ProductConfig` and `TenantConfig`
  - loads remote translations
  - resolves config-relative assets
- `../legacy-donor-app/src/contexts/ConfigContext.tsx`
  - loads product config
  - resolves tenant
  - loads tenant config
  - falls back to product default tenant
  - applies tenant theme CSS variables
  - merges remote i18n resources

This is the strongest reference implementation for PR-01 and part of PR-02.

## 3. Tenant resolution

- `../legacy-donor-app/src/lib/tenantResolver.ts`
  - checks subdomain first
  - then first path segment
  - ignores reserved app routes
  - falls back to a default tenant

This directly maps to the planned `subdomain -> path -> default_tenant` rule, but it needs adaptation for:

- GitHub Pages repo slug handling already present in `greentic-webchat`
- current `/tenant/embed` mode

## 4. Authentication

### Current auth state

- `../legacy-donor-app/src/contexts/AuthContext.tsx`
  - purely in-memory auth state
  - `login(username, password)` accepts any non-empty username
  - no persistence
  - no callback handling

### Login page

- `../legacy-donor-app/src/pages/Login.tsx`
  - reads enabled providers from tenant config
  - supports `dummy` and `oidc`
  - generates OIDC `state`
  - stores `oidc_state` and `oidc_provider` in `sessionStorage`
  - builds a real authorization URL and redirects

Useful harvest:

- provider-button rendering model
- OIDC URL construction pattern

Important limitation:

- there is no callback route or token exchange
- auth state is demo-only

## 5. Internationalisation

- `../legacy-donor-app/src/i18n/index.ts`
  - uses `i18next`, `react-i18next`, `i18next-browser-languagedetector`
  - persists locale in `localStorage` under `app_locale`
  - fallback is `variant -> base -> en`
- `../legacy-donor-app/src/i18n/locales.ts`
  - contains large locale registry with native-language labels
  - identifies RTL locales
- `../legacy-donor-app/src/components/LanguageSelector.tsx`
  - locale dropdown UI
  - updates `document.documentElement.dir`
  - updates `document.documentElement.lang`

This is the main reference for PR-02 i18n work.

## 6. Header / navigation / branding

- `../legacy-donor-app/src/components/TenantHeader.tsx`
  - tenant logo from config
  - nav menu from `tenant.navigation.menu`
  - language selector in header
  - login/logout control in shell
- `../legacy-donor-app/src/contexts/ConfigContext.tsx`
  - applies branding colors and fonts to CSS variables

Useful harvest:

- data shape for navigation
- dynamic logo/theme application

Risk:

- current visual system is Tailwind/shadcn-based and much heavier than `greentic-webchat`

## 7. Guided playbooks and fixtures

- `../legacy-donor-app/src/components/ChatContainer.tsx`
  - progressive disclosure model:
    - category menu
    - category detail menu
    - multi-card flow
  - simple natural-language pattern routing
- `../legacy-donor-app/src/data/flowData.ts`
  - telecom-oriented sample data and flow card structures

Useful harvest:

- category taxonomy
- playbook list
- sample data shapes
- NL trigger heuristics

Not directly reusable:

- custom chat rendering
- custom “AdaptiveCard” component rather than Bot Framework Adaptive Cards

## 8. Config payload examples

- `../legacy-donor-app/public/config/product.json`
- `../legacy-donor-app/public/config/tenants/example.json`
- `../legacy-donor-app/public/config/tenants/greentic.json`
- `../legacy-donor-app/public/config/i18n/en.json`
- `../legacy-donor-app/public/config/i18n/ar.json`

These provide useful example payloads for:

- `product_name_short` / `product_name_long`
- `default_tenant`
- tenant branding
- tenant navigation
- auth provider arrays
- remote i18n files

## Recommended harvest boundary

Safe to harvest conceptually:

- config file shapes
- tenant resolver logic
- locale registry and RTL helpers
- provider button / OIDC redirect construction
- menu taxonomy and fixture content

Do not copy over wholesale:

- custom chat rendering layer
- shadcn/Tailwind shell design system
- in-memory auth context as final auth solution

## Bottom line

`legacy-donor-app` is a good donor for shell/auth/i18n/config/playbook concepts, but not for WebChat rendering. The migration should harvest the data models and UX logic while keeping `greentic-webchat` on standard Bot Framework WebChat APIs.
