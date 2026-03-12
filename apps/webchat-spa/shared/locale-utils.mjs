export const SUPPORTED_LOCALES = [
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'ar-AE', name: 'العربية (الإمارات)', rtl: true },
  { code: 'ar-DZ', name: 'العربية (الجزائر)', rtl: true },
  { code: 'ar-EG', name: 'العربية (مصر)', rtl: true },
  { code: 'ar-IQ', name: 'العربية (العراق)', rtl: true },
  { code: 'ar-MA', name: 'العربية (المغرب)', rtl: true },
  { code: 'ar-SA', name: 'العربية (السعودية)', rtl: true },
  { code: 'ar-SD', name: 'العربية (السودان)', rtl: true },
  { code: 'ar-SY', name: 'العربية (سوريا)', rtl: true },
  { code: 'ar-TN', name: 'العربية (تونس)', rtl: true },
  { code: 'ay', name: 'Aymar aru', rtl: false },
  { code: 'bg', name: 'Български', rtl: false },
  { code: 'bn', name: 'বাংলা', rtl: false },
  { code: 'cs', name: 'Čeština', rtl: false },
  { code: 'da', name: 'Dansk', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'el', name: 'Ελληνικά', rtl: false },
  { code: 'en', name: 'English', rtl: false },
  { code: 'en-GB', name: 'English (UK)', rtl: false },
  { code: 'en-US', name: 'English (US)', rtl: false },
  { code: 'es', name: 'Español', rtl: false },
  { code: 'et', name: 'Eesti', rtl: false },
  { code: 'fa', name: 'فارسی', rtl: true },
  { code: 'fi', name: 'Suomi', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'gn', name: 'Avañeʼẽ', rtl: false },
  { code: 'gu', name: 'ગુજરાતી', rtl: false },
  { code: 'hi', name: 'हिन्दी', rtl: false },
  { code: 'hr', name: 'Hrvatski', rtl: false },
  { code: 'ht', name: 'Kreyòl ayisyen', rtl: false },
  { code: 'hu', name: 'Magyar', rtl: false },
  { code: 'id', name: 'Bahasa Indonesia', rtl: false },
  { code: 'it', name: 'Italiano', rtl: false },
  { code: 'ja', name: '日本語', rtl: false },
  { code: 'km', name: 'ភាសាខ្មែរ', rtl: false },
  { code: 'kn', name: 'ಕನ್ನಡ', rtl: false },
  { code: 'ko', name: '한국어', rtl: false },
  { code: 'lo', name: 'ລາວ', rtl: false },
  { code: 'lt', name: 'Lietuvių', rtl: false },
  { code: 'lv', name: 'Latviešu', rtl: false },
  { code: 'ml', name: 'മലയാളം', rtl: false },
  { code: 'mr', name: 'मराठी', rtl: false },
  { code: 'ms', name: 'Bahasa Melayu', rtl: false },
  { code: 'my', name: 'မြန်မာ', rtl: false },
  { code: 'nah', name: 'Nāhuatl', rtl: false },
  { code: 'ne', name: 'नेपाली', rtl: false },
  { code: 'nl', name: 'Nederlands', rtl: false },
  { code: 'no', name: 'Norsk', rtl: false },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'pl', name: 'Polski', rtl: false },
  { code: 'pt', name: 'Português', rtl: false },
  { code: 'qu', name: 'Runasimi', rtl: false },
  { code: 'ro', name: 'Română', rtl: false },
  { code: 'ru', name: 'Русский', rtl: false },
  { code: 'si', name: 'සිංහල', rtl: false },
  { code: 'sk', name: 'Slovenčina', rtl: false },
  { code: 'sr', name: 'Srpski', rtl: false },
  { code: 'sv', name: 'Svenska', rtl: false },
  { code: 'ta', name: 'தமிழ்', rtl: false },
  { code: 'te', name: 'తెలుగు', rtl: false },
  { code: 'th', name: 'ไทย', rtl: false },
  { code: 'tl', name: 'Filipino', rtl: false },
  { code: 'tr', name: 'Türkçe', rtl: false },
  { code: 'uk', name: 'Українська', rtl: false },
  { code: 'ur', name: 'اردو', rtl: true },
  { code: 'vi', name: 'Tiếng Việt', rtl: false },
  { code: 'zh', name: '中文', rtl: false }
];

const SUPPORTED_CODES = new Set(SUPPORTED_LOCALES.map((locale) => locale.code));
const RTL_CODES = new Set(SUPPORTED_LOCALES.filter((locale) => locale.rtl).map((locale) => locale.code));

export function getLocaleName(code) {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code)?.name || code;
}

export function isRtlLocale(code) {
  if (!code) {
    return false;
  }
  return RTL_CODES.has(code) || RTL_CODES.has(code.split('-')[0]);
}

export function buildLocaleFallbackChain(locale, fallbackLocale = 'en') {
  const candidates = [];
  const push = (value) => {
    if (value && !candidates.includes(value)) {
      candidates.push(value);
    }
  };

  push(locale);
  if (locale && locale.includes('-')) {
    push(locale.split('-')[0]);
  }
  push(fallbackLocale);
  return candidates;
}

function resolveSupportedLocaleCandidate(value) {
  if (!value) {
    return '';
  }
  if (SUPPORTED_CODES.has(value)) {
    return value;
  }
  const base = value.split('-')[0];
  if (SUPPORTED_CODES.has(base)) {
    return base;
  }
  return '';
}

export function resolvePreferredLocale({
  persistedLocale = '',
  browserLocales = [],
  defaultLocale = ''
} = {}) {
  const persisted = resolveSupportedLocaleCandidate(persistedLocale);
  if (persisted) {
    return persisted;
  }

  for (const candidate of browserLocales) {
    const resolved = resolveSupportedLocaleCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }

  const fallback = resolveSupportedLocaleCandidate(defaultLocale);
  if (fallback) {
    return fallback;
  }

  return 'en';
}
