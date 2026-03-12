import { useEffect, useRef, useState } from 'react';
import { getLocaleName, SUPPORTED_LOCALES } from '../i18n/locales';

function GlobeIcon() {
  return (
    <svg className="locale-selector__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.75 12h16.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 3.5c2.15 2.3 3.34 5.38 3.34 8.5S14.15 18.2 12 20.5c-2.15-2.3-3.34-5.38-3.34-8.5S9.85 5.8 12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`locale-selector__chevron${open ? ' locale-selector__chevron--open' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LanguageSelector({
  currentLocale,
  onChange
}: {
  currentLocale: string;
  onChange: (locale: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentName = getLocaleName(currentLocale);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="locale-selector" ref={rootRef}>
      <button
        type="button"
        className="locale-selector__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon />
        <span className="locale-selector__label">{currentName}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div className="locale-selector__menu" role="menu" aria-label="Locale">
          <div className="locale-selector__list">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale.code}
                type="button"
                role="menuitemradio"
                aria-checked={locale.code === currentLocale}
                className={`locale-selector__option${locale.code === currentLocale ? ' locale-selector__option--active' : ''}`}
                onClick={() => {
                  onChange(locale.code);
                  setOpen(false);
                }}
              >
                {locale.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
