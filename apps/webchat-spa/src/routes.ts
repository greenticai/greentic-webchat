import { resolveTenantTarget } from '../shared/runtime-config.mjs';

export type AppRoute =
  | { type: 'home' }
  | { type: 'login' }
  | { type: 'auth-callback'; providerId: string };

export function resolveAppRoute({
  defaultTenant,
  explicitTenant,
  hostname,
  pathname,
  search
}: {
  defaultTenant: string;
  explicitTenant: string;
  hostname: string;
  pathname: string;
  search: string;
}): AppRoute {
  const result = resolveTenantTarget({
    pathname,
    search,
    hostname,
    explicitTenant,
    fallbackTenant: defaultTenant
  }) as { segments: string[]; source: string };

  let routeSegments = [...result.segments];
  if (result.source === 'path' && routeSegments[0] === explicitTenant) {
    routeSegments = routeSegments.slice(1);
  }

  if (routeSegments[0] === 'login') {
    return { type: 'login' };
  }

  if (routeSegments[0] === 'auth' && routeSegments[1] === 'callback' && routeSegments[2]) {
    return { type: 'auth-callback', providerId: routeSegments[2] };
  }

  return { type: 'home' };
}

function normalizeBasePath(basePath: string) {
  return basePath.endsWith('/') ? basePath : `${basePath}/`;
}

export function buildAppRoutePath({
  basePath,
  isEmbed,
  target,
  tenant,
  tenantResolution
}: {
  basePath: string;
  isEmbed: boolean;
  target: 'home' | 'login';
  tenant: string;
  tenantResolution: { source: string };
}) {
  const prefix = normalizeBasePath(basePath);
  const relative =
    tenantResolution.source === 'path'
      ? target === 'home'
        ? isEmbed
          ? `${tenant}/embed`
          : `${tenant}`
        : `${tenant}/login`
      : target === 'home'
        ? isEmbed
          ? 'embed'
          : ''
        : 'login';

  return relative ? `${prefix}${relative}` : prefix;
}
