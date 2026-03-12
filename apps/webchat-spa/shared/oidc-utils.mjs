export function buildOidcAuthorizationUrl(provider, state) {
  if (!provider?.authorizationUrl || !provider.clientId || !provider.redirectUri) {
    throw new Error('OIDC provider is missing required fields.');
  }

  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    response_type: provider.responseType || 'code',
    scope: provider.scope || 'openid profile email',
    state
  });

  if (provider.audience) {
    params.set('audience', provider.audience);
  }
  if (provider.prompt) {
    params.set('prompt', provider.prompt);
  }

  return `${provider.authorizationUrl}?${params.toString()}`;
}
