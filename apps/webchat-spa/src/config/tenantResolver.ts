import { resolveTenantTarget } from '../../shared/runtime-config.mjs';
import type { TenantResolution } from './types';

interface TenantResolverInput {
  dataTenant?: string;
  explicitTenant?: string;
  fallbackTenant?: string;
  hostname?: string;
  pathname: string;
  search?: string;
}

export function resolveTenant(input: TenantResolverInput): TenantResolution {
  return resolveTenantTarget({
    pathname: input.pathname,
    search: input.search || '',
    hostname: input.hostname || '',
    dataTenant: input.dataTenant || '',
    explicitTenant: input.explicitTenant || '',
    fallbackTenant: input.fallbackTenant
  }) as TenantResolution;
}
