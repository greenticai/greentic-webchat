import { buildOidcAuthorizationUrl } from '../../shared/oidc-utils.mjs';
import type { AuthProviderConfig } from '../config/types';

const OIDC_STATE_KEY = 'oidc_state';
const OIDC_PROVIDER_KEY = 'oidc_provider';

export function beginOidcRedirect(provider: AuthProviderConfig) {
  const state = crypto.randomUUID();
  sessionStorage.setItem(OIDC_STATE_KEY, state);
  sessionStorage.setItem(OIDC_PROVIDER_KEY, provider.id);
  const url = buildOidcAuthorizationUrl(provider, state);
  window.location.assign(url);
}

export function readOidcCallback(providerId: string, search: string) {
  const params = new URLSearchParams(search);
  const returnedState = params.get('state') || '';
  const storedState = sessionStorage.getItem(OIDC_STATE_KEY) || '';
  const storedProvider = sessionStorage.getItem(OIDC_PROVIDER_KEY) || '';
  const code = params.get('code') || '';
  const error = params.get('error') || '';

  if (!returnedState || !storedState || returnedState !== storedState || storedProvider !== providerId) {
    return {
      ok: false,
      code,
      error: error || '',
      reason: 'state-mismatch'
    } as const;
  }

  return {
    ok: true,
    code,
    error,
    reason: code ? 'code-received' : 'no-code'
  } as const;
}
