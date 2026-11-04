/**
 * Locale registry and the resolver that turns a multi-language value into a
 * string for the active locale.
 *
 * Every translatable value in this site is stored as
 *   { en: '…', 'zh-Hant': '…', 'zh-Hans': '…' }
 * and resolved with `pick(value, locale)`.
 *
 * Rules for translators:
 *   · Traditional Chinese (zh-Hant) is written for Hong Kong readers — 繁體,
 *     香港用語, and it is the master text for anything zh-Hans is derived from.
 *   · Simplified Chinese (zh-Hans) is written for Mainland readers — 简体,
 *     中国内地用语.
 *   · Never machine-convert between the two. They are separate authored
 *     strings, because Hong Kong and Mainland are different markets with
 *     different vocabulary.
 *   · All Chinese copy must be screened against the 中国广告法 banned-word
 *     list before it ships. See `docs/COPY_COMPLIANCE.md`.
 */

export const DEFAULT_LOCALE = 'en';

export const LOCALES = [
  {
    code: 'en',
    htmlLang: 'en-HK',
    shortLabel: 'EN',
    name: 'English',
    nameLocal: 'English',
  },
  {
    code: 'zh-Hant',
    htmlLang: 'zh-Hant',
    shortLabel: '繁',
    name: 'Traditional Chinese',
    nameLocal: '繁體中文',
  },
  {
    code: 'zh-Hans',
    htmlLang: 'zh-Hans',
    shortLabel: '简',
    name: 'Simplified Chinese',
    nameLocal: '简体中文',
  },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function isLocale(value) {
  return LOCALE_CODES.includes(value);
}

export function localeMeta(code) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/**
 * Resolve a translatable value for the active locale.
 *
 * Falls back to English when a translation is missing, so a partially
 * translated string degrades to English rather than rendering as `undefined`.
 *
 * Most values are copy and resolve to a string. A few are *structure* — a
 * per-locale list, say, where each locale supplies an array of mark
 * descriptors. Those are returned as-is rather than coerced, so a single
 * resolver covers both. No call site relies on a non-string being flattened.
 */
export function pick(value, locale) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);

  const direct = value[locale];
  if (typeof direct === 'string' && direct.length > 0) return direct;
  if (direct != null && typeof direct !== 'string') return direct;

  const fallback = value[DEFAULT_LOCALE];
  if (typeof fallback === 'string' && fallback.length > 0) return fallback;
  if (fallback != null && typeof fallback !== 'string') return fallback;

  return '';
}

/**
 * Build a locale-prefixed path.
 *   path('/work')  →  '/en/work'
 *
 * `external` links (http://, mailto:) are returned untouched.
 */
export function localePath(locale, to = '/') {
  if (!to) return `/${locale}`;
  if (/^(https?:|mailto:|tel:|#)/.test(to)) return to;

  const clean = to.startsWith('/') ? to : `/${to}`;
  return `/${locale}${clean === '/' ? '' : clean}`;
}
