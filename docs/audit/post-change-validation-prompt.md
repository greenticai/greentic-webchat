# ChatGPT validation prompt — review greentic-webchat migration plan / implementation

Validate the implemented migration for `greentic-webchat`.

## Context

This app was migrated to support:

- remote `product.json` + `tenant.json`
- tenant resolution by subdomain or path
- Greentic fallback tenant
- config-driven login buttons
- dummy login
- OIDC redirect URL building plus callback seam
- large locale dropdown with native names
- browser language as the initial default locale before user override
- locale fallback `variant -> base -> en`
- RTL for Arabic variants
- tenant-driven navigation
- tenant-driven DirectLine backend
- tenant-driven WebChat / Adaptive Card visual config
- guided telecom playbooks in standard Adaptive Cards
- preservation of Microsoft Bot Framework WebChat compatibility

## Inputs

### 1. Post-change summary

Source:

- `docs/audit/post-change-validation.md`

Key points:

- runtime config now loads `product.json` and `tenant.json`
- Greentic is the config-level fallback tenant
- `skin.json` remains the active WebChat bridge
- auth shell, locale selector, RTL, tenant shell branding, and OIDC redirect builder are implemented
- tenant config now drives supported WebChat and Direct Line inputs
- guided playbooks are injected as standard Adaptive Card activities only

### 2. Current-state audit

Source:

- `docs/audit/current-state.md`

Use this for baseline comparison against the original architecture.

### 3. zain-network intake notes

Source:

- `docs/audit/zain-network-intake.md`

Use this for donor-pattern comparison only, not for custom chat rendering.

### 4. File touch map

Source:

- `docs/audit/file-touch-map.md`

Use this to confirm whether actual changes stayed within the intended staged boundaries.

### 5. Implementation delta

Source:

- `docs/audit/implementation-delta.md`

Use this to check whether the final implementation still follows the intended migration shape.

### 6. Risk register

Source:

- `docs/audit/risk-register.md`

Use this to verify which original risks remain and whether any new ones were created.

### 7. Actual changed files

Main implementation areas:

- runtime config:
  - `apps/webchat-spa/src/config/*`
  - `apps/webchat-spa/shared/runtime-config.mjs`
  - `apps/webchat-spa/public/config/*`
- auth / shell / i18n:
  - `apps/webchat-spa/src/auth/*`
  - `apps/webchat-spa/src/i18n/*`
  - `apps/webchat-spa/src/components/AppHeader.tsx`
  - `apps/webchat-spa/src/components/LoginPage.tsx`
  - `apps/webchat-spa/src/components/LanguageSelector.tsx`
  - `apps/webchat-spa/src/components/AuthCallbackPage.tsx`
  - `apps/webchat-spa/src/routes.ts`
  - `apps/webchat-spa/public/i18n/*`
- WebChat adapter:
  - `apps/webchat-spa/src/webchat/tenantWebChatAdapter.ts`
  - `apps/webchat-spa/shared/webchat-config.mjs`
  - `apps/webchat-spa/src/lib/directline.ts`
  - `apps/webchat-spa/src/bootstrap.ts`
- guided playbooks:
  - `apps/webchat-spa/shared/playbook-engine.mjs`
  - `apps/webchat-spa/src/playbooks/middleware.ts`

High-risk changed files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/lib/directline.ts`

Files intentionally kept stable:

- tenant hook files under `public/skins/*/webchat/hooks.js`
- fullpage tenant shells under `public/skins/*/fullpage/index.html`

### 8. Test and validation results

Commands run:

```bash
npm run -w apps/webchat-spa typecheck
npm run test:runtime-config
npm run validate:skins
npm run build
```

Observed results:

- typecheck passed
- runtime/shared tests passed
- skin validation passed
- build passed

Environment note:

- build succeeded under Node `20.12.2` with a Vite warning recommending `20.19+` or `22.12+`

### 9. Compatibility facts to preserve

- WebChat still loads from the official Microsoft CDN
- `createDirectLine` still uses standard semantics
- `renderWebChat` still mounts into the same DOM seam
- guided flows use only standard Adaptive Card attachments
- no custom chat renderer was introduced

### 10. Known gaps

- OIDC callback is still a seam only; token exchange is deferred
- dummy login is demo-only
- guided playbooks are fixture-driven
- browser screenshots and full browser automation are not included
- `skin.json` remains the active compatibility bridge

## What to validate

Please review and answer these questions:

1. Does the implemented sequence still look safe in hindsight?
2. What Microsoft Bot Framework / Adaptive Card compatibility risks remain after the actual changes?
3. What auth/OIDC edge cases still look under-specified?
4. What i18n/locale/RTL risks remain in the shipped behavior?
5. What tenant-resolution or remote-config pitfalls remain after implementation?
6. What tests are still missing before merge?
7. What rollback / fallback behaviour is still missing?
8. Which implemented areas are still too coupled and should be split further?
9. Do the guided playbooks meet the workshop-style requirements while staying Bot Framework-safe?
10. Is any implemented area still hardcoding product/tenant assumptions instead of loading from config?
11. Are any stop-sign issues present that should block merge now?

## Required output format

Return:

### A. Overall verdict
- green / amber / red

### B. Top 10 risks

### C. Recommended changes before implementation/merge

### D. Test checklist

### E. Compatibility checklist specific to Microsoft Bot Framework

### F. Any missing requirement you believe should be added now rather than later
