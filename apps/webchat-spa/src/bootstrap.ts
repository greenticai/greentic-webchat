import { resolveTenant } from './tenant';
import {
  Skin,
  skinSchema,
  SkinHooksModule,
  WebChatConfig,
  WebChatExports,
  WebChatStore
} from './types';
import { resolveDirectLineConfig } from './lib/directline';
import { watchWebChatConnection } from './state/connection';

const WEBCHAT_CDN = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js';
const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/';
const ALLOWED_PUBLIC_PROTOCOLS = new Set(['http:', 'https:']);

let webChatPromise: Promise<WebChatExports> | undefined;
const hooksCache = new Map<string, Promise<SkinHooksModule>>();

export interface PreparedExperience {
  tenant: string;
  mode: 'fullpage' | 'widget';
  skin: Skin;
  shellHtml?: string;
  renderWebChat: (target: HTMLElement) => Promise<void>;
}

export async function prepareExperience(): Promise<PreparedExperience> {
  const { tenant, isEmbed } = resolveTenant(window.location.pathname);
  const skin = await fetchSkin(tenant);
  const mode: 'fullpage' | 'widget' = isEmbed ? 'widget' : skin.mode;

  applyBranding(skin);
  if (mode === 'fullpage') {
    applyFullPageCss(skin.fullpage.css);
  } else {
    clearFullPageCss();
  }

  const shellPromise =
    mode === 'fullpage'
      ? fetchFullPageShell(resolvePublicUrl(skin.fullpage.index))
      : Promise.resolve<string | undefined>(undefined);

  const [webChat, directLineConfig, styleOptions, hostConfig, hooksModule, shellHtml] = await Promise.all([
    ensureWebChatLoaded(),
    resolveDirectLineConfig(skin.directLine.tokenUrl),
    fetchJson<Record<string, unknown>>(skin.webchat.styleOptions),
    fetchJson<Record<string, unknown>>(skin.webchat.adaptiveCardsHostConfig),
    loadHooks(skin.hooks?.script),
    shellPromise
  ]);

  return {
    tenant,
    mode,
    skin,
    // shellHtml is served from a tenant-controlled template, not user input.
    shellHtml,
    renderWebChat: async (target: HTMLElement) => {
      if (!target) {
        throw new Error('Missing WebChat mount node');
      }

      const domain = directLineConfig.domain || skin.directLine.domain;
      const directLineConfigOptions = {
        token: directLineConfig.token,
        webSocket: skin.directLine.webSocket ?? true,
        ...(domain ? { domain } : {})
      };
      const directLine = webChat.createDirectLine(directLineConfigOptions);
      const config: WebChatConfig = {
        directLine,
        locale: skin.webchat.locale ?? 'en-US',
        styleOptions,
        adaptiveCardsHostConfig: hostConfig
      };

      const middleware = hooksModule?.createStoreMiddleware?.();
      let store: WebChatStore | undefined;
      if (webChat.createStore) {
        store = middleware ? webChat.createStore({}, middleware) : webChat.createStore();
        if (store) {
          config.store = store;
        }
      }

      watchWebChatConnection(store, directLine as {
        connectionStatus$?: {
          subscribe: (listener: (status: unknown) => void) => { unsubscribe?: () => void };
        };
      });

      await hooksModule?.onBeforeRender?.({ tenant, skin, webchatConfig: config });
      webChat.renderWebChat(config, target);
    }
  };
}

async function fetchSkin(tenant: string): Promise<Skin> {
  const response = await fetch(resolvePublicUrl(`skins/${tenant}/skin.json`), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to load skin for tenant "${tenant}"`);
  }
  const json = await response.json();
  return skinSchema.parse(json);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(resolvePublicUrl(url), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return (await response.json()) as T;
}

async function fetchFullPageShell(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to load full page template at ${url}`);
  }
  const html = await response.text();
  return rewriteShellHtml(html);
}

async function ensureWebChatLoaded(): Promise<WebChatExports> {
  if (window.WebChat) {
    return window.WebChat;
  }

  if (!webChatPromise) {
    webChatPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = WEBCHAT_CDN;
      script.async = true;
      script.onload = () => {
        if (window.WebChat) {
          resolve(window.WebChat);
        } else {
          reject(new Error('WebChat script loaded without exposing window.WebChat'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load BotFramework WebChat script.'));
      document.head.appendChild(script);
    });
  }

  return webChatPromise;
}

async function loadHooks(script?: string): Promise<SkinHooksModule | undefined> {
  if (!script) {
    return undefined;
  }
  const url = resolvePublicUrl(script);
  if (!hooksCache.has(url)) {
    hooksCache.set(
      url,
      (async () => {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Unable to fetch hooks file at ${url}`);
        }
        const code = await response.text();
        const blob = new Blob([`${code}\n//# sourceURL=${url}`], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        try {
          const module = await import(/* @vite-ignore */ blobUrl);
          return module as SkinHooksModule;
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      })()
    );
  }
  try {
    return await hooksCache.get(url);
  } catch (error) {
    console.error('Unable to load hooks module', error);
    throw error;
  }
}

function applyBranding(skin: Skin) {
  document.title = `${skin.brand.name} · WebChat`;
  document.documentElement.style.setProperty('--brand-primary', skin.brand.primary);
  setFavicon(skin.brand.favicon);
}

function setFavicon(href: string) {
  let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = resolvePublicUrl(href);
}

let cssHandle: HTMLLinkElement | undefined;

function applyFullPageCss(href: string) {
  const resolved = resolvePublicUrl(href);
  if (cssHandle && cssHandle.href === new URL(resolved, window.location.origin).href) {
    return;
  }
  if (cssHandle) {
    cssHandle.remove();
  }
  cssHandle = document.createElement('link');
  cssHandle.rel = 'stylesheet';
  cssHandle.href = resolved;
  cssHandle.dataset.skinCss = 'true';
  document.head.appendChild(cssHandle);
}

function clearFullPageCss() {
  if (cssHandle) {
    cssHandle.remove();
    cssHandle = undefined;
  }
}

function getRuntimeBase(): string {
  if (typeof window !== 'undefined' && window.__BASE_PATH__) {
    const candidate = window.__BASE_PATH__;
    return candidate.endsWith('/') ? candidate : `${candidate}/`;
  }
  return base;
}

function assertSafeProtocol(url: string): void {
  try {
    const baseForValidation =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://localhost';
    const parsed = new URL(url, baseForValidation);
    if (!ALLOWED_PUBLIC_PROTOCOLS.has(parsed.protocol)) {
      throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }
  } catch (error) {
    throw new Error(`Blocked unsafe URL "${url}": ${(error as Error).message}`);
  }
}

export function resolvePublicUrl(input: string): string {
  if (!input) {
    throw new Error('Cannot resolve empty URL');
  }
  const absolute = input.trim();
  const resolved = /^https?:/i.test(absolute)
    ? absolute
    : `${getRuntimeBase()}${absolute.replace(/^\/+/, '')}`;

  assertSafeProtocol(resolved);
  return resolved;
}

function rewriteShellHtml(html: string): string {
  return html
    .replace(/(src|href)=(['"])\/(skins\/[^'"]+)\2/g, (_match, attr, quote, path) => {
      return `${attr}=${quote}${resolvePublicUrl(path)}${quote}`;
    })
    .replace(/url\((['"]?)\/(skins\/[^)'"]+)\1\)/g, (_match, quote, path) => {
      const q = quote || '';
      return `url(${q}${resolvePublicUrl(path)}${q})`;
    });
}
