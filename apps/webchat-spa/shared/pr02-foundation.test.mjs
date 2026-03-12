import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOidcAuthorizationUrl } from './oidc-utils.mjs';
import { buildLocaleFallbackChain, isRtlLocale, resolvePreferredLocale } from './locale-utils.mjs';

test('resolvePreferredLocale prefers persisted choice, then browser locale, then default, then en', () => {
  assert.equal(
    resolvePreferredLocale({
      persistedLocale: 'ar-EG',
      browserLocales: ['fr-CA'],
      defaultLocale: 'en'
    }),
    'ar-EG'
  );

  assert.equal(
    resolvePreferredLocale({
      browserLocales: ['fr-CA', 'de-DE'],
      defaultLocale: 'en'
    }),
    'fr'
  );

  assert.equal(
    resolvePreferredLocale({
      browserLocales: [],
      defaultLocale: 'en-GB'
    }),
    'en-GB'
  );
});

test('buildLocaleFallbackChain follows variant to base to en', () => {
  assert.deepEqual(buildLocaleFallbackChain('ar-EG'), ['ar-EG', 'ar', 'en']);
  assert.deepEqual(buildLocaleFallbackChain('en'), ['en']);
});

test('isRtlLocale detects arabic variants', () => {
  assert.equal(isRtlLocale('ar'), true);
  assert.equal(isRtlLocale('ar-EG'), true);
  assert.equal(isRtlLocale('en-US'), false);
});

test('buildOidcAuthorizationUrl includes optional audience and prompt', () => {
  const url = buildOidcAuthorizationUrl(
    {
      authorizationUrl: 'https://example.com/authorize',
      clientId: 'client-123',
      redirectUri: 'https://app.example.com/auth/callback/provider',
      scope: 'openid profile email',
      responseType: 'code',
      audience: 'api://webchat',
      prompt: 'login'
    },
    'state-123'
  );

  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://example.com');
  assert.equal(parsed.searchParams.get('client_id'), 'client-123');
  assert.equal(parsed.searchParams.get('state'), 'state-123');
  assert.equal(parsed.searchParams.get('audience'), 'api://webchat');
  assert.equal(parsed.searchParams.get('prompt'), 'login');
});
