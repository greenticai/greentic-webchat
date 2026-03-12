import { mergeWebChatConfig, resolveTenantWebChatSpec } from '../../shared/webchat-config.mjs';
import type { TenantConfig } from '../config/types';
import type { Skin } from '../types';

export interface TenantWebChatSpec {
  adaptiveCardsHostConfigOverrides: Record<string, unknown>;
  adaptiveCardsHostConfigUrl: string;
  directLineDomain?: string;
  directLineTokenUrl: string;
  locale: string;
  styleOptionsOverrides: Record<string, unknown>;
  styleOptionsUrl: string;
}

export function buildTenantWebChatSpec(skin: Skin, tenantConfig?: TenantConfig): TenantWebChatSpec {
  return resolveTenantWebChatSpec({ skin, tenantConfig }) as TenantWebChatSpec;
}

export function applyTenantWebChatOverrides(
  baseValue: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  return mergeWebChatConfig(baseValue, overrides) as Record<string, unknown>;
}
