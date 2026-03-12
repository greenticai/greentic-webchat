import { resolveConfigBase } from '../../shared/runtime-config.mjs';
import type { ProductConfig, TenantConfig } from './types';

const JSON_FETCH_INIT: RequestInit = {
  cache: 'no-store',
  credentials: 'omit'
};

function getRuntimeBase(): string {
  if (typeof window !== 'undefined' && window.__BASE_PATH__) {
    return window.__BASE_PATH__;
  }
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${base}/`;
}

export function getConfigBase(): string {
  return resolveConfigBase({
    appConfigBase: typeof window !== 'undefined' ? window.APP_CONFIG_BASE || '' : '',
    envConfigBase: import.meta.env.VITE_APP_CONFIG_BASE || '',
    runtimeBase: getRuntimeBase()
  }) as string;
}

async function tryFetchJson<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(url, JSON_FETCH_INIT);
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[runtime-config] Failed to load ${url}`, error);
    return undefined;
  }
}

export async function loadProductConfig(configBase = getConfigBase()): Promise<ProductConfig | undefined> {
  return tryFetchJson<ProductConfig>(`${configBase}/product.json`);
}

export async function loadTenantConfig(
  tenantId: string,
  configBase = getConfigBase()
): Promise<TenantConfig | undefined> {
  if (!tenantId) {
    return undefined;
  }
  return tryFetchJson<TenantConfig>(`${configBase}/tenants/${encodeURIComponent(tenantId)}.json`);
}
