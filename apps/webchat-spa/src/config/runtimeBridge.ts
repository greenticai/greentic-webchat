import { buildSkinCandidateList, DEFAULT_FALLBACK_TENANT } from '../../shared/runtime-config.mjs';
import { loadProductConfig, loadTenantConfig, getConfigBase } from './configLoader';
import { resolveTenant } from './tenantResolver';
import type { RuntimeBridge, TenantConfig } from './types';

function getHtmlTenant(): string {
  return document.documentElement.getAttribute('data-tenant') || '';
}

function getExplicitTenant(): string {
  return typeof window !== 'undefined' ? window.__TENANT__ || '' : '';
}

function getFallbackTenant(productConfig?: { default_tenant?: string }): string {
  return productConfig?.default_tenant?.trim() || DEFAULT_FALLBACK_TENANT;
}

function getResolvedFallbackConfig(
  requestedTenant: string,
  fallbackTenant: string,
  requestedTenantConfig?: TenantConfig,
  fallbackTenantConfig?: TenantConfig
) {
  if (requestedTenant === fallbackTenant) {
    return requestedTenantConfig;
  }
  return fallbackTenantConfig;
}

export async function loadRuntimeBridge(): Promise<RuntimeBridge> {
  const configBase = getConfigBase();
  const productConfig = await loadProductConfig(configBase);
  const defaultTenant = getFallbackTenant(productConfig);
  const tenantResolution = resolveTenant({
    pathname: window.location.pathname,
    search: window.location.search,
    hostname: window.location.hostname,
    dataTenant: getHtmlTenant(),
    explicitTenant: getExplicitTenant(),
    fallbackTenant: defaultTenant
  });

  const requestedTenant = tenantResolution.tenant;
  const requestedTenantConfig = await loadTenantConfig(requestedTenant, configBase);
  const fallbackTenantConfig =
    requestedTenant === defaultTenant ? requestedTenantConfig : await loadTenantConfig(defaultTenant, configBase);
  const resolvedFallbackConfig = getResolvedFallbackConfig(
    requestedTenant,
    defaultTenant,
    requestedTenantConfig,
    fallbackTenantConfig
  );
  const skinCandidates = buildSkinCandidateList({
    requestedTenant,
    requestedTenantConfig,
    fallbackTenant: defaultTenant,
    fallbackTenantConfig: resolvedFallbackConfig
  } as {
    requestedTenant: string;
    requestedTenantConfig?: TenantConfig;
    fallbackTenant: string;
    fallbackTenantConfig?: TenantConfig;
  }) as string[];

  return {
    configBase,
    defaultTenant,
    fallbackTenantConfig: resolvedFallbackConfig,
    isEmbed: tenantResolution.isEmbed,
    productConfig,
    requestedTenant,
    requestedTenantConfig,
    skinCandidates,
    tenantResolution
  };
}
