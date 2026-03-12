import { buildLocaleFallbackChain, isRtlLocale, resolvePreferredLocale } from './locales';

const LOCALE_STORAGE_KEY = 'app_locale';

export type Messages = Record<string, string>;

function getAssetBase() {
  const base = window.__BASE_PATH__ || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function resolveLocaleAssetUrl(locale: string) {
  return `${getAssetBase()}i18n/${locale}.json`;
}

async function tryLoadMessages(locale: string): Promise<Messages | undefined> {
  try {
    const response = await fetch(resolveLocaleAssetUrl(locale), { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as Messages;
  } catch {
    return undefined;
  }
}

export function getStoredLocale(): string {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredLocale(locale: string) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore storage failures
  }
}

export function detectInitialLocale(defaultLocale = ''): string {
  const persisted = getStoredLocale();
  const browserLocales = typeof navigator !== 'undefined' ? Array.from(navigator.languages || [navigator.language]) : [];
  return resolvePreferredLocale({
    persistedLocale: persisted,
    browserLocales,
    defaultLocale
  });
}

export async function loadMessagesForLocale(locale: string): Promise<Messages> {
  const chain = buildLocaleFallbackChain(locale);
  const merged: Messages = {};
  for (const candidate of [...chain].reverse()) {
    const messages = await tryLoadMessages(candidate);
    if (messages) {
      Object.assign(merged, messages);
    }
  }
  return merged;
}

export function applyLocaleToDocument(locale: string) {
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
}

function interpolate(template: string, params?: Record<string, string>) {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => params[key] ?? '');
}

export function translate(messages: Messages, key: string, params?: Record<string, string>) {
  const template = messages[key] || key;
  return interpolate(template, params);
}
