# Post-Change Validation Brief

Use this document with `.codex/CHATGPT-VALIDATION-PROMPT.md` for the required post-change validation pass.

## Scope completed

Implemented stages:

1. PR-01 runtime config foundation
2. PR-02 auth, locale selector, shell branding/navigation
3. PR-03 WebChat tenant mapping and Direct Line config migration
4. PR-04 guided Adaptive Card playbooks

PR-05 is documentation and validation-gate packaging only.

## Final architecture summary

- `product.json` and `tenant.json` now load at runtime from `public/config/`.
- Tenant resolution now supports query override, explicit/runtime override, `data-tenant`, subdomain, path, and default fallback.
- Greentic is the config-level fallback tenant.
- `skin.json` remains the active boot bridge for Bot Framework safety.
- Login providers now come from tenant config and support both `dummy` and `oidc`.
- Browser language is used as the initial locale default when no user preference exists.
- Locale persistence, native-language dropdown, `variant -> base -> en` fallback, and Arabic RTL shell switching are implemented.
- Product/tenant branding and navigation are rendered in the React shell.
- Tenant config now drives supported WebChat inputs:
  - Direct Line token URL
  - optional Direct Line domain
  - style options URL and inline overrides
  - Adaptive Cards host config URL and inline overrides
  - tenant default chat locale
- Guided telecom playbooks now appear inside chat as standard Adaptive Card attachments only.

## Files changed across implementation PRs

Major implementation areas:

- runtime config:
  - `apps/webchat-spa/src/config/*`
  - `apps/webchat-spa/shared/runtime-config.mjs`
  - `apps/webchat-spa/public/config/*`
- auth + i18n + shell:
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
  - `apps/webchat-spa/shared/legacy-demo-playbook-engine.mjs`
  - `apps/webchat-spa/src/playbooks/legacyDemoMiddleware.ts`
- docs:
  - `docs/runtime-config.md`
  - `docs/webchat-tenant-config.md`
  - `docs/playbooks.md`
  - `README.md`

Bot Framework safety seams intentionally left intact:

- official Microsoft WebChat CDN load
- standard `createDirectLine` usage
- standard `renderWebChat` mount seam
- tenant hook files under `public/skins/*/webchat/hooks.js`
- legacy fullpage tenant shells under `public/skins/*/fullpage/index.html`

## Validation evidence from implementation

Commands run repeatedly during implementation:

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
- production build passed

Known environment note:

- Vite warns that the local Node version is `20.12.2` and recommends `20.19+` or `22.12+`, but the build completed successfully.

## Added tests

- tenant resolution and runtime config tests in `apps/webchat-spa/shared/runtime-config.test.mjs`
- locale and OIDC helper tests in `apps/webchat-spa/shared/pr02-foundation.test.mjs`
- WebChat adapter tests in `apps/webchat-spa/shared/webchat-config.test.mjs`
- guided playbook engine tests in `apps/webchat-spa/shared/legacy-demo-playbook-engine.test.mjs`

## Known deviations or limits

- OIDC callback handling is still a seam/status page only; token exchange is deferred.
- Dummy login is local-session only.
- Guided playbooks are fixture-driven and do not call live telecom backends.
- No custom chat renderer was introduced.
- `skin.json` remains the active bridge rather than being fully removed.

## Questions to emphasize in post-change validation

- Is the current playbook middleware insertion safe enough, or should the guided-flow injection be isolated further?
- Are there remaining Bot Framework compatibility risks around synthetic incoming activities for Adaptive Card playbooks?
- Is the OIDC callback seam sufficiently defined for a later real auth integration?
- Are there any missing browser-level smoke tests that should now be mandatory before merge?
