(function () {
  const KNOWN_REPO_SLUGS = new Set(['greentic-webchat']);

  function getPathSegments() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const segments = parts.slice();
    const host = window.location.hostname;
    if (host.endsWith('github.io') && segments.length && KNOWN_REPO_SLUGS.has(segments[0])) {
      segments.shift();
    }
    return segments.filter((segment) => segment && !/^index\.html?$/i.test(segment));
  }

  function resolveTenant() {
    const qs = new URLSearchParams(window.location.search);
    const fromQuery = qs.get('tenant');
    if (fromQuery) {
      return fromQuery.trim();
    }

    const fromAttr = (document.documentElement.getAttribute('data-tenant') || '').trim();
    if (fromAttr) {
      return fromAttr;
    }

    const segments = getPathSegments();
    return segments[0] || 'default';
  }

  function ensureTrailingSlash(input) {
    if (!input) {
      return '/';
    }
    return input.endsWith('/') ? input : `${input}/`;
  }

  function sanitizeText(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeTenantName(name) {
    return (
      String(name || '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .substring(0, 64) || 'default'
    );
  }

  function resolveBasePath() {
    const baseTag = document.querySelector('base');
    if (baseTag) {
      const href = baseTag.getAttribute('href');
      if (href) {
        return ensureTrailingSlash(href);
      }
    }

    const host = window.location.hostname;
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (host.endsWith('github.io') && segments.length) {
      return ensureTrailingSlash(`/${segments[0]}`);
    }

    return '/';
  }

  function injectSkinError(tenantText, baseText) {
    const wrapper = document.createElement('div');
    wrapper.style.background = '#fee2e2';
    wrapper.style.color = '#7f1d1d';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '8px';
    wrapper.style.margin = '8px 0';

    const message = document.createElement('div');
    message.textContent = `Something went wrong — Unable to load skin for tenant ${tenantText}.`;
    wrapper.appendChild(message);

    const baseLine = document.createElement('div');
    baseLine.style.opacity = '0.8';
    baseLine.style.fontSize = '12px';
    baseLine.textContent = `Base path: ${baseText}`;
    wrapper.appendChild(baseLine);

    const target = document.getElementById('skin-error');
    if (target) {
      target.insertAdjacentElement('afterbegin', wrapper);
      return;
    }

    function write() {
      if (document.body) {
        document.body.insertAdjacentElement('afterbegin', wrapper);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', write, { once: true });
    } else {
      write();
    }
  }

  function initGlobals() {
    if (!window.__TENANT__) {
      window.__TENANT__ = resolveTenant();
    }
    if (!window.__BASE_PATH__) {
      window.__BASE_PATH__ = ensureTrailingSlash(resolveBasePath());
    }
  }

  initGlobals();

  window.__loadSkin__ = async function loadSkin() {
    const tenant = window.__TENANT__ || resolveTenant();
    const safeTenant = sanitizeTenantName(tenant);
    const base = ensureTrailingSlash(window.__BASE_PATH__ || resolveBasePath());
    const url = `${base}skins/${encodeURIComponent(safeTenant)}/skin.json`;
    const safeBase = sanitizeText(base);
    const safeUrl = sanitizeText(url);
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const skin = await res.json();
      window.__SKIN__ = skin;
      console.info('[webchat] skin loaded', { tenant: safeTenant, url: safeUrl });
      return skin;
    } catch (err) {
      console.error('[webchat] Unable to load skin', { tenant: safeTenant, url: safeUrl, error: err });
      injectSkinError(safeTenant, safeBase);
      throw err;
    }
  };
})();
