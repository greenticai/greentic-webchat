import { translate, type Messages } from './i18n/runtimeI18n';

/** Attribute naming a catalog key whose text replaces the element's own. */
const TEXT_KEY_ATTR = 'data-i18n';

/**
 * Attribute naming a catalog key whose text replaces the element's
 * `aria-label`.
 *
 * Both shipped skins label their nav landmark `aria-label="Site navigation"`,
 * which a screen reader announces and a sighted reader never sees — so it is
 * exactly the kind of string that stays English long after the visible copy is
 * fixed.
 */
const ARIA_LABEL_KEY_ATTR = 'data-i18n-aria-label';

/**
 * Translate the marked-up text of a tenant's full-page shell.
 *
 * # Why the shell needs its own pass
 *
 * The shell is tenant-authored HTML injected with `dangerouslySetInnerHTML`,
 * not React elements, so none of it reaches `translate()` the way the SPA's own
 * copy does. Everything a skin writes — the status pill, the footer, the
 * document links — therefore rendered in whatever language the skin was
 * authored in, however the visitor had set the picker. It reached an operator
 * as a Spanish conversation sitting inside an English page.
 *
 * # The contract a skin opts into
 *
 * A skin marks a translatable element with `data-i18n="<key>"`, or
 * `data-i18n-aria-label="<key>"` for an accessible name, and keeps the
 * authored English as the element's content. That English is what a viewer
 * sees when the key is missing, because it is never removed — this pass only
 * overwrites, it never empties.
 *
 * Unmarked elements are left exactly as authored, so an existing skin that has
 * never heard of this renders byte-for-byte as it did before.
 *
 * # An element with children is skipped, loudly
 *
 * Replacing `textContent` would delete those children, and the shapes a skin
 * naturally writes have them — a status pill wraps its own dot, a footer line
 * wraps a brand. Silently eating one would be a far worse bug than the
 * untranslated string it replaced, so the element is left alone and the skin
 * author is told to wrap the words in their own element instead.
 */
export function localizeShellHtml(html: string, messages: Messages): string {
  // A skin that opts out costs one substring scan and no parse. This also
  // keeps the pre-existing skins on their exact current bytes.
  if (!html.includes(TEXT_KEY_ATTR)) {
    return html;
  }

  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const root = parsed.body;
  if (!root) {
    return html;
  }

  for (const element of Array.from(root.querySelectorAll(`[${TEXT_KEY_ATTR}]`))) {
    const key = element.getAttribute(TEXT_KEY_ATTR);
    if (!key) {
      continue;
    }
    if (element.childElementCount > 0) {
      console.warn(
        `[shell-i18n] "${key}" marks an element with child elements; wrap the words in ` +
          'their own element so translating them cannot delete the children.'
      );
      continue;
    }
    element.textContent = translate(messages, key);
  }

  for (const element of Array.from(root.querySelectorAll(`[${ARIA_LABEL_KEY_ATTR}]`))) {
    const key = element.getAttribute(ARIA_LABEL_KEY_ATTR);
    if (key) {
      element.setAttribute('aria-label', translate(messages, key));
    }
  }

  return root.innerHTML;
}
