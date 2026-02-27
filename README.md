# Greentic WebChat

Static, skinnable BotFramework-WebChat experiences built with React + Vite. Each tenant lives entirely inside `public/skins/{tenant}` so pushing to `main` instantly deploys new demos via GitHub Pages.

## Quick start

```bash
npm install
npm run dev           # local SPA at http://localhost:5173
npm run validate:skins
npm run build         # validates skins, builds, and copies index -> 404 fallback
```

> **Note:** Rollup distributes platform-specific native bindings. If you switch Node versions/architectures (e.g., Apple Silicon arm64 vs Rosetta x64) and see `Cannot find module @rollup/rollup-…`, delete `node_modules`, run `npm install`, and re-run your build so npm can reinstall the matching optional dependency. The root `optionalDependencies` list keeps both darwin builds declared explicitly for reproducible installs.

To run the same checks we expect in CI, execute:

```bash
./ci/local_check.sh
```

This script installs dependencies, type-checks the SPA, validates all skins, and runs the production build so you can catch issues before pushing.

The primary app lives under `apps/webchat-spa`. Example embeds live under `packages/embed-examples`.

## Repository layout

```
apps/
  webchat-spa/        React/Vite SPA + runtime bootstrap
    public/skins/     Tenant assets, skins, hooks, and HTML
packages/
  embed-examples/     Vanilla + React embedding samples
.github/workflows/    GitHub Pages deployment
```

## Runtime behavior

- Tenant resolution honors `?tenant=...`, then `<html data-tenant="...">`, and finally the first non-repo path segment (`/customera`, `/customerb/embed`, etc.).
- The SPA downloads `/skins/{tenant}/skin.json`, validates it with the shared Zod schema, and loads asset files in parallel.
- Direct Line tokens are fetched at runtime from `greentic-messaging` using the `tokenUrl` inside the skin; nothing is embedded during build.
- WebChat is loaded from the official CDN and rendered with tenant style options + Adaptive Cards host config.
- Optional `hooks.js` modules can register store middleware or run pre-render logic.
- Full-page skins stream their own HTML/CSS shell; widget mode renders the lightweight SPA layout.

## Skins & docs

- [`docs/skins.md`](docs/skins.md) – how to add tenants, assets, and hooks.
- [`docs/embedding.md`](docs/embedding.md) – snippets for loading the widget from third-party sites.
- [`docs/pages.md`](docs/pages.md) – CI/CD + custom domain instructions.

### Tenant & Base Path Resolution (GitHub Pages-friendly)

GitHub Pages serves this repo from `/<repo>/...`, so we include a tiny resolver (`docs/js/tenant-resolver.js`) before any other frontend code. It sets two globals:

1. `window.__TENANT__` prefers `?tenant=foo`, then `<html data-tenant="foo">`, and finally the first path segment **after** the repo name (so `/greentic-webchat/cisco` resolves to `cisco`, not `greentic-webchat`). The fallback tenant is `demo`.
2. `window.__BASE_PATH__` honors `<base href>` when present; otherwise it becomes `/greentic-webchat/` on Pages and `/` locally.

All skin fetches now use those values:

```ts
const url = `${window.__BASE_PATH__}skins/${encodeURIComponent(window.__TENANT__)}.json`;
const skin = await (await fetch(url, { credentials: 'omit' })).json();
```

Published skins (including the Cisco showcase) live under `docs/skins/`, so Pages serves them at `https://<org>.github.io/greentic-webchat/skins/<tenant>.json`. The resolver also exposes `window.__loadSkin__()` which loads the JSON, stores it on `window.__SKIN__`, and shows a non-blocking banner if the fetch fails.

#### Manual QA checklist

- **Local (SPA):** `npm run dev`, open `http://localhost:5173/?tenant=cisco`, confirm `window.__TENANT__ === 'cisco'`, `window.__BASE_PATH__ === '/'`, and no “Unable to load skin” banner.
- **Local (static docs):** `npm run sync:cisco && (cd docs && python3 -m http.server 8080)`, open `http://localhost:8080/cisco?tenant=cisco`, confirm the Cisco skin loads from `/skins/cisco.json`.
- **GitHub Pages:** `https://greenticai.github.io/greentic-webchat/cisco` should download `/greentic-webchat/skins/cisco.json`, log `__TENANT__ === 'cisco'`, `__BASE_PATH__ === '/greentic-webchat/'`, and render without errors—even with overrides such as `?tenant=customerb`.

## GitHub Pages

`.github/workflows/pages.yaml` runs on every push to `main`, validates skins, builds the SPA, and deploys `/apps/webchat-spa/dist` to the Pages environment. The build copies `index.html` to `404.html` so deep links resolve without server routing.

