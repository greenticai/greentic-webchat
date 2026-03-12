export type LocalizedValue = string | { i18n: string };

export interface ProductConfig {
  product_url?: string;
  product_name_short?: LocalizedValue;
  product_name_long?: LocalizedValue;
  default_tenant?: string;
  default_language?: string;
}

export interface TenantNavigationItem {
  id: string;
  label?: LocalizedValue;
  url?: string;
}

export interface AuthProviderConfig {
  id: string;
  label: LocalizedValue;
  type: 'dummy' | 'oidc';
  enabled: boolean;
  authorizationUrl?: string;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  responseType?: string;
  audience?: string;
  prompt?: string;
}

export interface TenantConfig {
  tenant_id: string;
  legacy_skin?: string;
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    fonts?: {
      primary?: string;
      secondary?: string;
    };
    company_name?: LocalizedValue;
    tagline?: LocalizedValue;
  };
  navigation?: {
    menu?: TenantNavigationItem[];
  };
  webchat?: {
    directline_url?: string;
    directline?: {
      token_url?: string;
      domain?: string;
    };
    style_options_url?: string;
    style_options?: Record<string, unknown>;
    adaptive_cards_host_config_url?: string;
    adaptive_cards_host_config?: Record<string, unknown>;
    adaptive_card_style?: Record<string, unknown>;
    locale?: string;
  };
  auth?: {
    providers?: AuthProviderConfig[];
  };
}

export interface TenantResolution {
  tenant: string;
  isEmbed: boolean;
  segments: string[];
  source: 'override' | 'subdomain' | 'path' | 'default';
}

export interface RuntimeBridge {
  configBase: string;
  defaultTenant: string;
  fallbackTenantConfig?: TenantConfig;
  isEmbed: boolean;
  productConfig?: ProductConfig;
  requestedTenant: string;
  requestedTenantConfig?: TenantConfig;
  skinCandidates: string[];
  tenantResolution: TenantResolution;
}
