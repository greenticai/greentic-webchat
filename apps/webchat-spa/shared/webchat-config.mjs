function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const result = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    result[key] = cloneValue(nestedValue);
  }
  return result;
}

export function mergeWebChatConfig(baseValue, overrideValue) {
  if (overrideValue === undefined) {
    return cloneValue(baseValue);
  }
  if (baseValue === undefined) {
    return cloneValue(overrideValue);
  }
  if (Array.isArray(overrideValue)) {
    return cloneValue(overrideValue);
  }
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return cloneValue(overrideValue);
  }

  const result = { ...cloneValue(baseValue) };
  for (const [key, value] of Object.entries(overrideValue)) {
    result[key] = key in result ? mergeWebChatConfig(result[key], value) : cloneValue(value);
  }
  return result;
}

export function resolveTenantWebChatSpec({ skin, tenantConfig } = {}) {
  const tenantWebChat = tenantConfig?.webchat || {};
  const directLine = tenantWebChat.directline || {};

  return {
    directLineTokenUrl: directLine.token_url || tenantWebChat.directline_url || skin?.directLine?.tokenUrl || '',
    directLineDomain: directLine.domain || undefined,
    styleOptionsUrl: tenantWebChat.style_options_url || skin?.webchat?.styleOptions || '',
    styleOptionsOverrides: cloneValue(tenantWebChat.style_options || {}),
    adaptiveCardsHostConfigUrl:
      tenantWebChat.adaptive_cards_host_config_url || skin?.webchat?.adaptiveCardsHostConfig || '',
    adaptiveCardsHostConfigOverrides: cloneValue(
      tenantWebChat.adaptive_cards_host_config || tenantWebChat.adaptive_card_style || {}
    ),
    locale: tenantWebChat.locale || skin?.webchat?.locale || 'en-US'
  };
}
