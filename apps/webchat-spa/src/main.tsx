import { StrictMode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { prepareExperience, PreparedExperience } from './bootstrap';
import { StatusBar } from './components/StatusBar';
import { sanitizeShellHtml } from './sanitizeShellHtml';
import { detectInitialLocale, applyLocaleToDocument, loadMessagesForLocale, setStoredLocale, translate } from './i18n/runtimeI18n';
import { AppHeader } from './components/AppHeader';
import { LoginPage } from './components/LoginPage';
import { beginOidcRedirect, readOidcCallback } from './auth/oidc';
import { signInDemo, signOut, useAuthSession } from './auth/session';
import type { AuthProviderConfig } from './config/types';
import { buildAppRoutePath, resolveAppRoute } from './routes';
import { AuthCallbackPage } from './components/AuthCallbackPage';

function localizeValue(value: string | { i18n: string } | undefined, messages: Record<string, string>) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return translate(messages, value.i18n);
}

interface LoadingState {
  status: 'loading';
}

interface ReadyState {
  status: 'ready';
  data: PreparedExperience;
}

interface ErrorState {
  status: 'error';
  message: string;
}

type AppState = LoadingState | ReadyState | ErrorState;

const App = () => {
  const [state, setState] = useState<AppState>({ status: 'loading' });
  const hasRendered = useRef(false);
  const authSession = useAuthSession();
  const [locale, setLocale] = useState(() => detectInitialLocale());
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [messagesReady, setMessagesReady] = useState(false);
  const [pageReady, setPageReady] = useState(() => document.readyState === 'complete');
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await prepareExperience();
        if (!cancelled) {
          hasRendered.current = false;
          const initialLocale = detectInitialLocale(data.productConfig?.default_language || data.skin.webchat.locale || 'en');
          setLocale(initialLocale);
          setState({ status: 'ready', data });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to prepare experience', error);
          setState({ status: 'error', message: 'status.experienceUnavailable' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMessagesReady(false);
    (async () => {
      const loadedMessages = await loadMessagesForLocale(locale);
      if (!cancelled) {
        setMessages(loadedMessages);
        applyLocaleToDocument(locale);
        setMessagesReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (pageReady) {
      return;
    }

    const handleLoad = () => setPageReady(true);
    window.addEventListener('load', handleLoad);

    return () => window.removeEventListener('load', handleLoad);
  }, [pageReady]);

  const route =
    state.status === 'ready'
      ? resolveAppRoute({
          defaultTenant: state.data.productConfig?.default_tenant || 'greentic',
          explicitTenant: state.data.tenant,
          hostname: window.location.hostname,
          pathname: window.location.pathname,
          search: window.location.search
        })
      : { type: 'home' as const };

  useEffect(() => {
    if (!authSession.isAuthenticated) {
      hasRendered.current = false;
      setChatError(null);
    }
  }, [authSession.isAuthenticated]);

  useEffect(() => {
    if (state.status !== 'ready') {
      return;
    }
    if (!authSession.isAuthenticated || route.type !== 'home' || !messagesReady || !pageReady) {
      return;
    }
    const mount = document.getElementById('webchat');
    if (!mount) {
      setState({ status: 'error', message: 'status.mountNodeMissing' });
      return;
    }
    mount.innerHTML = '';
    setChatError(null);
    state.data
      .renderWebChat(mount, { localeOverride: locale, messages })
      .then(() => {
        hasRendered.current = true;
      })
      .catch((error) => {
        hasRendered.current = false;
        mount.innerHTML = '';
        console.error('Unable to initialize Web Chat', error);
        setChatError((error as Error).message);
      });
  }, [authSession.isAuthenticated, locale, messagesReady, pageReady, route.type, state]);

  const navigateToRoute = (routePath: string) => {
    window.history.pushState({}, '', routePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const listener = () => {
      setState((current) => (current.status === 'ready' ? { ...current } : current));
    };
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  const handleLocaleChange = (nextLocale: string) => {
    setStoredLocale(nextLocale);
    setLocale(nextLocale);
  };

  const handleProviderClick = (provider: AuthProviderConfig) => {
    if (state.status !== 'ready') {
      return;
    }
    if (provider.type === 'dummy') {
      signInDemo(provider.id);
      navigateToRoute(
        buildAppRoutePath({
          basePath: window.__BASE_PATH__ || '/',
          isEmbed: state.data.mode === 'widget',
          target: 'home',
          tenant: state.data.tenant,
          tenantResolution: state.data.tenantResolution
        })
      );
      return;
    }
    beginOidcRedirect(provider);
  };

  const loadingText = translate(messages, 'status.loadingExperience');
  const errorTitle = translate(messages, 'status.errorTitle');
  const errorDetail = translate(messages, 'status.errorDetail');
  const chatUnavailableTitle = translate(messages, 'chat.unavailableTitle');
  const chatUnavailableBody = translate(messages, 'chat.unavailableBody');
  const chatRetryLabel = translate(messages, 'chat.retryAction');
  if (state.status === 'loading') {
    return (
      <div className="status-card">
        <p>{loadingText}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="status-card">
        <div className="error-message">
          <h1>{errorTitle}</h1>
          <p>{translate(messages, state.message)}</p>
          <p>{errorDetail}</p>
        </div>
      </div>
    );
  }

  if (route.type === 'auth-callback') {
    return (
      <AuthCallbackPage
        messages={messages}
        providerId={route.providerId}
        status={readOidcCallback(route.providerId, window.location.search)}
      />
    );
  }

  if (!authSession.isAuthenticated) {
    return (
      <LoginPage
        currentLocale={locale}
        messages={messages}
        onLocaleChange={handleLocaleChange}
        onProviderClick={handleProviderClick}
        product={state.data.productConfig}
        tenant={state.data.tenantConfig}
      />
    );
  }

  const { skin } = state.data;
  const tenantName = state.data.tenantConfig?.branding?.company_name;
  const translatedTenantName =
    typeof tenantName === 'string'
      ? tenantName
      : tenantName?.i18n
        ? translate(messages, tenantName.i18n)
        : skin.brand.name;
  const heroTitle =
    localizeValue(state.data.tenantConfig?.branding?.tagline, messages) || `${translatedTenantName} AI Assistant`;
  const heroSubtitle = localizeValue(state.data.productConfig?.product_name_long, messages) || 'Powered by Greentic';
  const chatCanvasSubtitle = translate(messages, 'chat.canvasSubtitle');

  return (
    <div className="app-shell">
      <AppHeader
        currentLocale={locale}
        isAuthenticated={authSession.isAuthenticated}
        messages={messages}
        onLocaleChange={handleLocaleChange}
        onLoginClick={() =>
          navigateToRoute(
            buildAppRoutePath({
              basePath: window.__BASE_PATH__ || '/',
              isEmbed: state.data.mode === 'widget',
              target: 'login',
              tenant: state.data.tenant,
              tenantResolution: state.data.tenantResolution
            })
          )
        }
        onLogoutClick={() => signOut()}
        product={state.data.productConfig}
        tenant={state.data.tenantConfig}
      />
      <section className="hero-band">
        <div className="hero-band__inner">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>
      </section>
      <main className="chat-stage">
        <section className="chat-shell">
          <div className="chat-shell-frame">
            <div className="chat-shell-card">
              <div className="chat-shell-head">
                <div className="chat-brand-mark">AI</div>
                <div className="chat-brand-copy">
                  <p>{heroTitle}</p>
                  <small>{chatCanvasSubtitle}</small>
                </div>
                <StatusBar
                  brand={skin.statusBar?.brand}
                  className="chat-status-inline"
                  messages={messages}
                  show={skin.statusBar?.show}
                />
              </div>
              <div id="webchat" className="widget-surface tenant-widget-surface" aria-live="polite" />
              {chatError ? (
                <div className="widget-fallback" role="alert">
                  <h2>{chatUnavailableTitle}</h2>
                  <p>{chatUnavailableBody}</p>
                  <button
                    className="primary-button"
                    onClick={() => setState((current) => (current.status === 'ready' ? { ...current } : current))}
                  >
                    {chatRetryLabel}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      {state.data.mode === 'fullpage' && state.data.shellHtml ? (
        <div className="legacy-shell-preview" dangerouslySetInnerHTML={{ __html: sanitizeShellHtml(state.data.shellHtml) }} />
      ) : null}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
