# Microsoft Bot Framework Compatibility Audit

## Current safe integration surface

`greentic-webchat` currently stays close to standard Bot Framework WebChat integration:

- loads official WebChat bundle from Microsoft CDN in `apps/webchat-spa/src/bootstrap.ts`
- uses `window.WebChat.createDirectLine(...)`
- uses `window.WebChat.renderWebChat(...)`
- passes standard `styleOptions`
- passes standard `adaptiveCardsHostConfig`
- optionally creates a standard store via `window.WebChat.createStore(...)`

No custom activity renderer or alternate chat transport was found in the React SPA.

## Current compatibility seams

## 1. Direct Line creation

File:

- `apps/webchat-spa/src/lib/directline.ts`

Risk:

- planned move from `skin.directLine.tokenUrl` to tenant-config-driven Direct Line settings could break token acquisition, domain overrides, or tenant-specific backends.

Must preserve:

- token fetch from an allowed backend
- optional Direct Line domain override semantics
- token fetch error handling

## 2. Style options and Adaptive Card host config

Files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/public/skins/*/webchat/styleOptions.json`
- `apps/webchat-spa/public/skins/*/webchat/hostconfig.json`

Risk:

- tenant styling expansion may drift into unsupported or nonstandard WebChat customization.

Must preserve:

- style changes via documented WebChat `styleOptions`
- Adaptive Card appearance via host config only
- standard Adaptive Card payload rendering path

## 3. Hooks and middleware

Files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/public/skins/*/webchat/hooks.js`

Risk:

- tenant hook modules can mutate store/config in ways that break WebChat expectations.

Must preserve:

- hooks remain optional
- hook API stays narrow
- no hook introduces custom protocol or nonstandard card renderer

## 4. Full-page shell HTML injection

Files:

- `apps/webchat-spa/src/bootstrap.ts`
- `apps/webchat-spa/src/sanitizeShellHtml.ts`
- `apps/webchat-spa/public/skins/*/fullpage/index.html`

Risk:

- shell redesign could accidentally couple shell markup with WebChat internals or break mount timing for `#webchat`.

Must preserve:

- WebChat mount lifecycle stays independent
- shell HTML remains sanitized
- full-page shell does not replace the WebChat render path

## 5. Tenant resolution and fallback

Files:

- `apps/webchat-spa/src/tenant.ts`
- `apps/webchat-spa/public/js/tenant-resolver.js`

Risk:

- moving to subdomain/path/product fallback can break tenant asset lookup and indirectly break WebChat boot.

Must preserve:

- deterministic tenant selection before WebChat boot
- safe fallback tenant when config fails
- GitHub Pages repo-slug handling

## Safe customization boundaries for future tenant config

Allowed to vary per tenant:

- Direct Line token URL / backend base
- Direct Line domain where supported
- WebChat locale
- WebChat `styleOptions`
- Adaptive Card host config
- shell branding, logos, colors, fonts, navigation

Not safe to vary freely:

- replacing `createDirectLine` / `renderWebChat` with custom transport or renderer
- introducing custom non-Adaptive-Card card formats inside chat
- bypassing standard WebChat store semantics
- altering bot activity handling in tenant hooks without test coverage

## Compatibility requirements by planned PR

## PR-01 runtime config foundation

Compatibility requirement:

- product/tenant config loader must be additive and must not break current skin boot path while the migration is in flight

## PR-02 auth/i18n/shell

Compatibility requirement:

- shell/login/i18n changes must remain outside the WebChat render path

## PR-03 webchat branding/directline

Compatibility requirement:

- tenant WebChat mapping layer must convert config into standard WebChat config only

## PR-04 guided playbooks

Compatibility requirement:

- guided flows inside chat must be expressed as standard Adaptive Cards, not custom React chat cards

## Required smoke checks

At minimum, every stage that touches boot/config should validate:

1. WebChat bundle loads from Microsoft CDN.
2. Direct Line token fetch still succeeds.
3. `createDirectLine` still receives a valid token.
4. `renderWebChat` still mounts into the expected DOM node.
5. A standard Adaptive Card sent by the bot still renders.
6. At least two tenants boot with distinct style settings.

## Bottom line

The current implementation is compatible largely because it is simple. The main risk is not the existing code; it is future coupling of shell/auth/playbook work to the WebChat render path. The migration should keep WebChat configuration translation as a thin adapter and keep all guided experiences within standard Adaptive Cards.
