import { ensureTrailingSlash, normalizePathSegments } from '../../shared/runtime-config.mjs';
import { resolveTenant } from './tenantResolver';

function resolveBasePath(): string {
  const baseTag = document.querySelector('base');
  if (baseTag) {
    const href = baseTag.getAttribute('href');
    if (href) {
      return ensureTrailingSlash(href) as string;
    }
  }

  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  const segments = normalizePathSegments(pathname, hostname) as string[];
  if (hostname.endsWith('github.io')) {
    const rawSegments = pathname.split('/').filter(Boolean);
    if (rawSegments.length > 0) {
      return ensureTrailingSlash(`/${rawSegments[0]}`) as string;
    }
  }

  if (segments.length === 0) {
    return '/';
  }

  return '/';
}

function initGlobals() {
  if (!window.__BASE_PATH__) {
    window.__BASE_PATH__ = resolveBasePath();
  }

  if (!window.__TENANT__) {
    const resolution = resolveTenant({
      pathname: window.location.pathname,
      search: window.location.search,
      hostname: window.location.hostname,
      dataTenant: document.documentElement.getAttribute('data-tenant') || ''
    });
    if (resolution.source !== 'default') {
      window.__TENANT__ = resolution.tenant;
    }
  }
}

async function loadLegacySkin() {
  const base = ensureTrailingSlash(window.__BASE_PATH__ || resolveBasePath()) as string;
  const resolution = resolveTenant({
    pathname: window.location.pathname,
    search: window.location.search,
    hostname: window.location.hostname,
    dataTenant: document.documentElement.getAttribute('data-tenant') || '',
    explicitTenant: window.__TENANT__ || ''
  });
  const url = `${base}skins/${encodeURIComponent(resolution.tenant)}/skin.json`;
  const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Unable to load skin for tenant "${resolution.tenant}"`);
  }
  const skin = await response.json();
  window.__SKIN__ = skin;
  return skin;
}

initGlobals();
window.__loadSkin__ = loadLegacySkin;
