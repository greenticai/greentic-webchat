# File Touch Map

## PR-00 audit only

Create:

- `docs/audit/current-state.md`
- `docs/audit/legacy-donor-intake.md`
- `docs/audit/microsoft-bot-framework-compatibility.md`
- `docs/audit/implementation-delta.md`
- `docs/audit/risk-register.md`
- `docs/audit/file-touch-map.md`

## PR-01 runtime config foundation

Likely new files:

- `apps/webchat-spa/src/config/configLoader.ts`
- `apps/webchat-spa/src/config/tenantResolver.ts`
- `apps/webchat-spa/src/config/types.ts`
- `apps/webchat-spa/src/context/runtimeConfigContext.tsx`

Likely modified files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/main.tsx`
- `apps/webchat-spa/src/tenant.ts` or replaced by config tenant resolver
- `apps/webchat-spa/public/js/tenant-resolver.js`
- `apps/webchat-spa/src/types.ts`
- `README.md`
- `docs/skins.md`

Likely config/examples:

- `apps/webchat-spa/public/config/product.json`
- `apps/webchat-spa/public/config/tenants/greentic.json`
- one non-default sample tenant config

## PR-02 auth + i18n + shell branding/navigation

Likely new files:

- `apps/webchat-spa/src/auth/AuthContext.tsx`
- `apps/webchat-spa/src/auth/oidc.ts`
- `apps/webchat-spa/src/i18n/index.ts`
- `apps/webchat-spa/src/i18n/locales.ts`
- `apps/webchat-spa/src/components/LanguageSelector.tsx`
- `apps/webchat-spa/src/components/LoginPage.tsx`

Likely modified files:

- `apps/webchat-spa/src/main.tsx`
- `apps/webchat-spa/src/style.css`
- `apps/webchat-spa/index.html`
- `apps/webchat-spa/src/bootstrap.ts`
- runtime config types/context files from PR-01

Likely test files:

- `apps/webchat-spa/src/auth/*.test.ts`
- `apps/webchat-spa/src/i18n/*.test.ts`

## PR-03 WebChat branding + Direct Line tenant mapping

Likely new files:

- `apps/webchat-spa/src/webchat/tenantWebChatAdapter.ts`
- `apps/webchat-spa/src/webchat/types.ts`

Likely modified files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/lib/directline.ts`
- `apps/webchat-spa/src/types.ts`
- sample tenant config files
- sample skin files during migration bridge period

Likely docs:

- `docs/skins.md`
- `docs/audit/microsoft-bot-framework-compatibility.md`

## PR-04 guided Adaptive Card playbooks

Likely new files:

- `apps/webchat-spa/src/playbooks/catalog.ts`
- `apps/webchat-spa/src/playbooks/fixtures.ts`
- `apps/webchat-spa/src/playbooks/adaptiveCards.ts`
- `apps/webchat-spa/src/playbooks/nlRouting.ts`

Likely modified files:

- WebChat integration seam in `apps/webchat-spa/src/bootstrap.ts` only if needed for menu launch hooks
- tenant config files if guided menu becomes tenant-configurable

Likely tests:

- playbook catalog tests
- Adaptive Card payload generation tests
- NL routing tests

## PR-05 validation gate

Likely modified files:

- `.codex/CODEX-IMPLEMENTATION-PROMPT.md`
- `.codex/CHATGPT-VALIDATION-PROMPT.md`
- CI or reviewer docs if needed

Possibly new docs:

- `docs/review-checklist.md`

## Files to treat as high-risk

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/lib/directline.ts`
- `apps/webchat-spa/src/tenant.ts`
- `apps/webchat-spa/public/js/tenant-resolver.js`
- any future OIDC callback/session code

## Files to avoid broad churn unless necessary

- tenant `fullpage/index.html` shells
- tenant `webchat/hooks.js` files
- generated/static mirror files under `site/`
