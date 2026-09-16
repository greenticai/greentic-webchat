import DOMPurify from 'dompurify';

const MISSING_TEMPLATE_FALLBACK = '<p>Missing full-page template.</p>';
const ALLOWED_TAGS = [
  'div',
  'span',
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'br',
  'h1',
  'h2',
  'h3',
  'header',
  'section',
  'nav',
  'img',
  'footer',
  'code'
];
// `data-i18n` / `data-i18n-aria-label` name a catalog key for
// `localizeShellHtml`.
// They must survive sanitising: DOMPurify drops every attribute not listed
// here, so omitting them makes the shell translation pass find nothing and
// fail silently — the skin renders in its authored language with no error.
const ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'class',
  'id',
  'src',
  'alt',
  'rel',
  'aria-label',
  'aria-live',
  'data-i18n',
  'data-i18n-aria-label'
];

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes server-controlled shell HTML. If you must interpolate user-provided
 * fragments, escape them with escapeHtml before composing the HTML.
 */
export function sanitizeShellHtml(html: string | undefined): string {
  const source = typeof html === 'string' && html.trim() ? html : MISSING_TEMPLATE_FALLBACK;
  const clean = DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR
  });
  return clean || MISSING_TEMPLATE_FALLBACK;
}
