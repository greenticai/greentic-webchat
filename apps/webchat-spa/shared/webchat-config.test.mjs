import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mergeWebChatConfig, resolveTenantWebChatSpec } from './webchat-config.mjs';

async function readJson(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const content = await readFile(url, 'utf8');
  return JSON.parse(content);
}

test('resolveTenantWebChatSpec keeps skin defaults when tenant webchat config is absent', () => {
  const spec = resolveTenantWebChatSpec({
    skin: {
      directLine: { tokenUrl: 'https://demo.greentic.ai/token?tenant=legacy' },
      webchat: {
        styleOptions: '/skins/legacy/styleOptions.json',
        adaptiveCardsHostConfig: '/skins/legacy/hostconfig.json',
        locale: 'en-US'
      }
    }
  });

  assert.equal(spec.directLineTokenUrl, 'https://demo.greentic.ai/token?tenant=legacy');
  assert.equal(spec.directLineDomain, undefined);
  assert.equal(spec.styleOptionsUrl, '/skins/legacy/styleOptions.json');
  assert.equal(spec.adaptiveCardsHostConfigUrl, '/skins/legacy/hostconfig.json');
  assert.equal(spec.locale, 'en-US');
  assert.deepEqual(spec.styleOptionsOverrides, {});
  assert.deepEqual(spec.adaptiveCardsHostConfigOverrides, {});
});

test('resolveTenantWebChatSpec prefers tenant-provided directline and supported style overrides', () => {
  const spec = resolveTenantWebChatSpec({
    skin: {
      directLine: { tokenUrl: 'https://demo.greentic.ai/token?tenant=legacy' },
      webchat: {
        styleOptions: '/skins/legacy/styleOptions.json',
        adaptiveCardsHostConfig: '/skins/legacy/hostconfig.json',
        locale: 'en-US'
      }
    },
    tenantConfig: {
      webchat: {
        directline: {
          token_url: 'https://tenant.example.com/token',
          domain: 'https://tenant.example.com/v3/directline'
        },
        style_options_url: '/config/webchat/styleOptions.json',
        style_options: { accent: '#005c9a' },
        adaptive_cards_host_config: { fontFamily: 'Cisco Sans' },
        locale: 'en-GB'
      }
    }
  });

  assert.equal(spec.directLineTokenUrl, 'https://tenant.example.com/token');
  assert.equal(spec.directLineDomain, 'https://tenant.example.com/v3/directline');
  assert.equal(spec.styleOptionsUrl, '/config/webchat/styleOptions.json');
  assert.equal(spec.adaptiveCardsHostConfigUrl, '/skins/legacy/hostconfig.json');
  assert.equal(spec.locale, 'en-GB');
  assert.deepEqual(spec.styleOptionsOverrides, { accent: '#005c9a' });
  assert.deepEqual(spec.adaptiveCardsHostConfigOverrides, { fontFamily: 'Cisco Sans' });
});

test('mergeWebChatConfig deep merges host config and replaces arrays', () => {
  const merged = mergeWebChatConfig(
    {
      fontFamily: 'Arial',
      actions: {
        actionsOrientation: 'vertical',
        buttonSpacing: 8
      },
      supportsInteractivity: true,
      arrayValue: ['a', 'b']
    },
    {
      actions: {
        buttonSpacing: 12
      },
      containerStyles: {
        default: {
          foregroundColors: {
            accent: {
              default: '#005c9a'
            }
          }
        }
      },
      arrayValue: ['c']
    }
  );

  assert.deepEqual(merged, {
    fontFamily: 'Arial',
    actions: {
      actionsOrientation: 'vertical',
      buttonSpacing: 12
    },
    supportsInteractivity: true,
    containerStyles: {
      default: {
        foregroundColors: {
          accent: {
            default: '#005c9a'
          }
        }
      }
    },
    arrayValue: ['c']
  });
});

test('sample tenant configs resolve tenant-driven WebChat inputs for greentic and cisco', async () => {
  const [greenticSkin, greenticTenant, ciscoSkin, ciscoTenant] = await Promise.all([
    readJson('../public/skins/_template/skin.json'),
    readJson('../public/config/tenants/greentic.json'),
    readJson('../public/skins/cisco/skin.json'),
    readJson('../public/config/tenants/cisco.json')
  ]);

  const greenticSpec = resolveTenantWebChatSpec({ skin: greenticSkin, tenantConfig: greenticTenant });
  const ciscoSpec = resolveTenantWebChatSpec({ skin: ciscoSkin, tenantConfig: ciscoTenant });

  assert.equal(greenticSpec.directLineTokenUrl, 'https://demo.greentic.ai/token?tenant=greentic');
  assert.equal(ciscoSpec.directLineDomain, 'https://directline.cisco.example/v3/directline');
  assert.equal(ciscoSpec.styleOptionsOverrides.accent, '#005c9a');
  assert.equal(greenticSpec.adaptiveCardsHostConfigOverrides.fontFamily, 'IBM Plex Sans, Arial, sans-serif');
});
