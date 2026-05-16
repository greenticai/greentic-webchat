import type { AuthProviderConfig, ProductConfig, TenantConfig } from '../config/types';
import type { Skin } from '../types';
import { resolvePublicUrl } from '../bootstrap';
import { translate } from '../i18n/runtimeI18n';
import { LanguageSelector } from './LanguageSelector';

function localizeValue(value: string | { i18n: string } | undefined, messages: Record<string, string>) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return translate(messages, value.i18n);
}

export function LoginPage({
  currentLocale,
  messages,
  onLocaleChange,
  onProviderClick,
  product,
  skin,
  tenant
}: {
  currentLocale: string;
  messages: Record<string, string>;
  onLocaleChange: (locale: string) => void;
  onProviderClick: (provider: AuthProviderConfig) => void;
  product?: ProductConfig;
  skin?: Skin;
  tenant?: TenantConfig;
}) {
  const providers = (tenant?.auth?.providers || []).filter((provider) => provider.enabled);
  const logoSource = skin?.brand?.logo || tenant?.branding?.logo;
  const logo = logoSource ? resolvePublicUrl(logoSource) : undefined;
  const productName = skin?.brand?.name || localizeValue(product?.product_name_short, messages) || tenant?.tenant_id || 'Greentic';
  const companyName = skin?.brand?.name || localizeValue(tenant?.branding?.company_name, messages) || productName;
  const tagline = localizeValue(tenant?.branding?.tagline, messages) || localizeValue(product?.product_name_long, messages);
  const isFullPageSkin = skin?.mode === 'fullpage';

  const card = (
    <div className={`login-card${isFullPageSkin ? ' login-card--skin' : ''}`}>
      <div className="login-card__header">
        <div className="login-badge">{productName.slice(0, 2).toUpperCase()}</div>
        <h1>{translate(messages, 'login.title', { product: productName })}</h1>
        <p>{translate(messages, 'login.subtitle')}</p>
      </div>
      <div className="login-provider-list">
        {providers.length === 0 ? (
          <div className="login-empty">{translate(messages, 'login.noProviders')}</div>
        ) : (
          providers.map((provider) => (
            <button key={provider.id} className="primary-button" onClick={() => onProviderClick(provider)}>
              {translate(messages, 'login.loginWith', {
                provider: localizeValue(provider.label, messages) || provider.id
              })}
            </button>
          ))
        )}
      </div>
    </div>
  );

  if (isFullPageSkin) {
    return (
      <div className="fullpage-shell login-shell login-shell--skin">
        <header className="topbar login-topbar">
          <div className="topbar__left login-topbar__left">
            {logo ? <img className="topbar__brand login-topbar__brand" src={logo} alt={`${companyName} logo`} /> : null}
            <div className="topbar__info login-topbar__info">
              <span className="topbar__title">{companyName}</span>
              {tagline ? <span className="topbar__subtitle">{tagline}</span> : null}
            </div>
          </div>
          <nav className="topbar-nav login-topbar__nav" aria-label="Site navigation" />
          <div className="topbar__controls login-topbar__controls">
            <LanguageSelector currentLocale={currentLocale} onChange={onLocaleChange} />
          </div>
        </header>

        <main className="chat-panel login-skin-panel">
          <div className="chat-panel__surface login-skin-surface">{card}</div>
        </main>

        <footer className="footer login-footer">
          <span>© 2026 {companyName}</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="login-shell">
      <header className="top-header top-header--login">
        <div className="top-header__brand">
          {logo ? <img src={logo} alt={`${companyName} logo`} /> : null}
        </div>
        <div className="top-header__actions">
          <LanguageSelector currentLocale={currentLocale} onChange={onLocaleChange} />
        </div>
      </header>

      <main className="login-panel">
        {card}
      </main>
    </div>
  );
}
