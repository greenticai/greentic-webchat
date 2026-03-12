import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSkinCandidateList,
  resolveConfigBase,
  resolveTenantTarget
} from './runtime-config.mjs';

test('resolveConfigBase prefers window override, then env, then runtime base fallback', () => {
  assert.equal(
    resolveConfigBase({
      appConfigBase: 'https://cdn.example.com/webchat',
      envConfigBase: 'https://env.example.com/config',
      runtimeBase: '/greentic-webchat/'
    }),
    'https://cdn.example.com/webchat'
  );
  assert.equal(
    resolveConfigBase({
      envConfigBase: 'remote-config',
      runtimeBase: '/greentic-webchat/'
    }),
    '/greentic-webchat/remote-config'
  );
  assert.equal(resolveConfigBase({ runtimeBase: '/greentic-webchat/' }), '/greentic-webchat/config');
});

test('resolveTenantTarget keeps GitHub Pages path handling and embed semantics', () => {
  const result = resolveTenantTarget({
    pathname: '/greentic-webchat/cisco/embed',
    hostname: 'greentic-ai.github.io',
    fallbackTenant: 'greentic'
  });

  assert.equal(result.tenant, 'cisco');
  assert.equal(result.isEmbed, true);
  assert.equal(result.source, 'path');
});

test('resolveTenantTarget resolves subdomain tenant before path and supports /embed', () => {
  const result = resolveTenantTarget({
    pathname: '/embed',
    hostname: 'zain.3aigent.com',
    fallbackTenant: 'greentic'
  });

  assert.equal(result.tenant, 'zain');
  assert.equal(result.isEmbed, true);
  assert.equal(result.source, 'subdomain');
});

test('resolveTenantTarget preserves explicit query override', () => {
  const result = resolveTenantTarget({
    pathname: '/cisco',
    search: '?tenant=customera',
    hostname: 'localhost',
    fallbackTenant: 'greentic'
  });

  assert.equal(result.tenant, 'customera');
  assert.equal(result.source, 'override');
});

test('buildSkinCandidateList keeps requested legacy skin first and Greentic fallback last', () => {
  assert.deepEqual(
    buildSkinCandidateList({
      requestedTenant: 'cisco',
      requestedTenantConfig: { tenant_id: 'cisco', legacy_skin: 'cisco' },
      fallbackTenant: 'greentic',
      fallbackTenantConfig: { tenant_id: 'greentic', legacy_skin: '_template' }
    }),
    ['cisco', '_template']
  );

  assert.deepEqual(
    buildSkinCandidateList({
      requestedTenant: 'customera',
      fallbackTenant: 'greentic',
      fallbackTenantConfig: { tenant_id: 'greentic', legacy_skin: '_template' }
    }),
    ['customera', '_template']
  );
});

test('buildSkinCandidateList preserves effective fallback order for unknown tenants', () => {
  assert.deepEqual(
    buildSkinCandidateList({
      requestedTenant: 'unknown-tenant',
      requestedTenantConfig: undefined,
      fallbackTenant: 'greentic',
      fallbackTenantConfig: { tenant_id: 'greentic', legacy_skin: '_template' }
    }),
    ['unknown-tenant', '_template']
  );
});
