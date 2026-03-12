import type { ProductConfig, TenantConfig, TenantNavigationItem } from '../config/types';
import { resolvePublicUrl } from '../bootstrap';
import { LanguageSelector } from './LanguageSelector';
import { translate } from '../i18n/runtimeI18n';

function localizeValue(value: string | { i18n: string } | undefined, messages: Record<string, string>) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return translate(messages, value.i18n);
}

function resolveNavLabel(item: TenantNavigationItem, messages: Record<string, string>) {
  return localizeValue(item.label, messages) || item.id;
}

export function AppHeader({
  currentLocale,
  isAuthenticated,
  messages,
  onLocaleChange,
  onLoginClick,
  onLogoutClick,
  product,
  tenant
}: {
  currentLocale: string;
  isAuthenticated: boolean;
  messages: Record<string, string>;
  onLocaleChange: (locale: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  product?: ProductConfig;
  tenant?: TenantConfig;
}) {
  const logo = tenant?.branding?.logo ? resolvePublicUrl(tenant.branding.logo) : undefined;
  const companyName = localizeValue(tenant?.branding?.company_name, messages) || tenant?.tenant_id || 'Greentic';
  const navItems = tenant?.navigation?.menu || [];

  return (
    <header className="top-header">
      <div className="top-header__start">
        <div className="top-header__brand">
          {logo ? <img src={logo} alt={`${companyName} logo`} /> : null}
        </div>
        <nav className="top-header__nav" aria-label="Tenant navigation">
          {navItems.map((item) => (
            <a key={item.id} href={item.url || '#'} target="_blank" rel="noreferrer noopener">
              {resolveNavLabel(item, messages)}
            </a>
          ))}
        </nav>
      </div>
      <div className="top-header__actions">
        <LanguageSelector currentLocale={currentLocale} onChange={onLocaleChange} />
        <button className="header-pill-button" onClick={isAuthenticated ? onLogoutClick : onLoginClick}>
          {translate(messages, isAuthenticated ? 'header.logout' : 'header.login')}
          {isAuthenticated ? <span className="header-pill-button__arrow" aria-hidden="true">→</span> : null}
        </button>
      </div>
    </header>
  );
}
