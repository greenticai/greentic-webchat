export const KNOWN_REPO_SLUGS = new Set(['greentic-webchat']);
export const RESERVED_PATHS = new Set(['embed', 'login', 'auth', 'admin', 'store', 'playbooks']);
export const DEFAULT_FALLBACK_TENANT = 'greentic';
export const DEFAULT_FALLBACK_SKIN = '_template';

function normalizeSegment(value) {
  return String(value || '').trim();
}

function normalizeTenantValue(value) {
  return normalizeSegment(value);
}

export function ensureTrailingSlash(input) {
  if (!input) {
    return '/';
  }
  return input.endsWith('/') ? input : `${input}/`;
}

export function normalizePathSegments(pathname, hostname = '') {
  const trimmed = String(pathname || '').replace(/(^\/+|\/+?$)/g, '');
  let segments = trimmed ? trimmed.split('/') : [];

  if (hostname.endsWith('github.io') && segments.length && KNOWN_REPO_SLUGS.has(segments[0])) {
    segments = segments.slice(1);
  }

  return segments.filter((segment) => segment && !/^index\.html?$/i.test(segment));
}

export function resolveSubdomainTenant(hostname = '') {
  const host = normalizeSegment(hostname).toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('github.io')) {
    return '';
  }

  const parts = host.split('.');
  if (parts.length < 3) {
    return '';
  }

  const subdomain = parts[0];
  if (!subdomain || subdomain === 'www' || subdomain === 'localhost') {
    return '';
  }

  return subdomain;
}

export function resolveTenantTarget({
  pathname = '/',
  search = '',
  hostname = '',
  dataTenant = '',
  explicitTenant = '',
  fallbackTenant = DEFAULT_FALLBACK_TENANT
} = {}) {
  const queryTenant = new URLSearchParams(search).get('tenant') || '';
  const overrideTenant =
    normalizeTenantValue(queryTenant) ||
    normalizeTenantValue(explicitTenant) ||
    normalizeTenantValue(dataTenant);
  const segments = normalizePathSegments(pathname, hostname);
  const subdomainTenant = resolveSubdomainTenant(hostname);
  const firstSegment = segments[0] || '';
  const pathTenant = RESERVED_PATHS.has(firstSegment) ? '' : firstSegment;
  const tenant =
    overrideTenant ||
    subdomainTenant ||
    pathTenant ||
    normalizeTenantValue(fallbackTenant) ||
    DEFAULT_FALLBACK_TENANT;

  const isEmbed = segments[0] === 'embed' || segments[1] === 'embed';
  const source = overrideTenant
    ? 'override'
    : subdomainTenant
      ? 'subdomain'
      : pathTenant
        ? 'path'
        : 'default';

  return { tenant, isEmbed, segments, source };
}

export function resolveConfigBase({
  appConfigBase = '',
  envConfigBase = '',
  runtimeBase = '/'
} = {}) {
  const preferred = normalizeSegment(appConfigBase) || normalizeSegment(envConfigBase);
  if (preferred) {
    if (/^https?:\/\//i.test(preferred)) {
      return preferred.replace(/\/+$/, '');
    }
    return `${ensureTrailingSlash(runtimeBase)}${preferred.replace(/^\/+/, '').replace(/\/+$/, '')}`;
  }

  return `${ensureTrailingSlash(runtimeBase)}config`.replace(/\/+$/, '');
}

export function buildSkinCandidateList({
  requestedTenant = '',
  requestedTenantConfig,
  fallbackTenant = DEFAULT_FALLBACK_TENANT,
  fallbackTenantConfig
} = {}) {
  const candidates = [];
  const push = (value) => {
    const normalized = normalizeTenantValue(value);
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  const requestedLegacySkin =
    requestedTenantConfig?.legacy_skin ||
    requestedTenantConfig?.legacySkin ||
    requestedTenantConfig?.tenant_id;

  const fallbackLegacySkin =
    fallbackTenantConfig?.legacy_skin ||
    fallbackTenantConfig?.legacySkin ||
    fallbackTenantConfig?.tenant_id ||
    (normalizeTenantValue(fallbackTenant) === DEFAULT_FALLBACK_TENANT ? DEFAULT_FALLBACK_SKIN : fallbackTenant);

  push(requestedLegacySkin);
  push(requestedTenant);
  push(fallbackLegacySkin);
  push(DEFAULT_FALLBACK_SKIN);

  return candidates;
}
