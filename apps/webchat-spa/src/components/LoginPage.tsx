import type { AuthProviderConfig, ProductConfig, TenantConfig } from '../config/types';
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
  tenant
}: {
  currentLocale: string;
  messages: Record<string, string>;
  onLocaleChange: (locale: string) => void;
  onProviderClick: (provider: AuthProviderConfig) => void;
  product?: ProductConfig;
  tenant?: TenantConfig;
}) {
  const providers = (tenant?.auth?.providers || []).filter((provider) => provider.enabled);
  const logo = tenant?.branding?.logo ? resolvePublicUrl(tenant.branding.logo) : undefined;
  const productName = localizeValue(product?.product_name_short, messages) || tenant?.tenant_id || 'Greentic';
  const companyName = localizeValue(tenant?.branding?.company_name, messages) || productName;

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
        <div className="login-card">
          <div className="login-card__header">
            <div className="login-badge">AI</div>
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
      </main>
    </div>
  );
}
