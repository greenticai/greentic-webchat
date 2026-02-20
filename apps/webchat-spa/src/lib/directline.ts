import { setTokenFetchState } from '../state/token';

export interface DirectLineConfig {
  token: string;
  domain?: string;
}

const DIRECT_LINE_PARAM = 'directline';

function getDirectLineOverride(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get(DIRECT_LINE_PARAM);
  return value?.trim() || null;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function looksLikeDirectLineDomain(url: URL): boolean {
  const cleanPath = (url.pathname || '/').replace(/\/+$/, '') || '/';
  return cleanPath === '/' || /\/v3\/directline$/i.test(cleanPath);
}

function buildDirectLineDomain(url: URL): string {
  const cleanPath = (url.pathname || '/').replace(/\/+$/, '');
  if (!cleanPath || cleanPath === '/') {
    return `${url.origin}/v3/directline`;
  }
  if (/\/v3\/directline$/i.test(cleanPath)) {
    return `${url.origin}${cleanPath}`;
  }
  return `${url.origin}${cleanPath}`;
}

async function requestToken(url: string): Promise<string> {
  setTokenFetchState('loading');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{}',
    credentials: 'omit'
  });
  if (!response.ok) {
    setTokenFetchState('error');
    throw new Error(`Direct Line token request failed (${response.status})`);
  }
  const payload = await response.json();
  if (!payload || typeof payload.token !== 'string') {
    setTokenFetchState('error');
    throw new Error('Token endpoint did not return a token.');
  }
  setTokenFetchState('ok');
  return payload.token;
}

export async function resolveDirectLineConfig(skinTokenUrl: string): Promise<DirectLineConfig> {
  const override = getDirectLineOverride();
  if (!override) {
    return { token: await requestToken(skinTokenUrl) };
  }

  const normalized = normalizeUrl(override);
  try {
    const token = await requestToken(normalized);
    return { token };
  } catch (error) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalized);
    } catch {
      throw error;
    }
    if (!looksLikeDirectLineDomain(parsedUrl)) {
      throw error;
    }
    const token = await requestToken(skinTokenUrl);
    const domain = buildDirectLineDomain(parsedUrl);
    return { token, domain };
  }
}
