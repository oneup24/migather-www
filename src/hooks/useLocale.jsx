import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, localePath, pick } from '../data/i18n';

/**
 * Locale context.
 *
 * The locale is not held in React state — it comes from the URL (`:locale`
 * route segment), so every language has its own indexable address and a link
 * can be shared in any language.
 */
const LocaleContext = createContext(null);

export function LocaleProvider({ locale, children }) {
  const value = {
    locale,
    htmlLang: locale === 'zh-Hans' ? 'zh-Hans' : locale === 'zh-Hant' ? 'zh-Hant' : 'en-HK',
    /** Resolve a `{ en, 'zh-Hant', 'zh-Hans' }` object for the active locale. */
    t: (value) => pick(value, locale),
    /** Build a locale-prefixed path. */
    path: (to) => localePath(locale, to),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}

export { DEFAULT_LOCALE };
