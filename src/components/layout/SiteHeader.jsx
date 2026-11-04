import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOCALES } from '../../data/i18n';
import { primaryNav, site } from '../../data/site';
import { content } from '../../data/content';
import { useLocale } from '../../hooks/useLocale';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { cn } from '../../lib/utils';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';

/**
 * The site header.
 *
 * Capsule48 and GAIA both float the navigation over the opening
 * photograph, so on the homepage the header starts transparent with white
 * type and turns solid as soon as the page scrolls. On inner pages it is
 * solid from the start.
 *
 * The nav itself is small caps with wide tracking — the Capsule48 header —
 * rather than the mixed-case list the v1 and v2 builds used.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { locale, path, t } = useLocale();
  useLockBodyScroll(open);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const overlay = isHome && !scrolled;

  const isActive = (to) =>
    to === '/' ? pathname === `/${locale}` || pathname === `/${locale}/` : pathname.startsWith(to);

  /** Swap the locale segment of the current path, keeping the page. */
  const localeHref = (code) => {
    const segments = pathname.split('/');
    segments[1] = code;
    const next = segments.join('/');
    // `next` already carries the leading slash — prefixing another would
    // emit "//zh-Hant/work", which a browser reads as the *host* "zh-Hant".
    return next === '' ? `/${code}` : next;
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        overlay ? 'bg-transparent' : 'border-b border-rule bg-white/92 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            to={path('/')}
            aria-label={`${site.name} — home`}
            className={cn('shrink-0 transition-colors', overlay && 'text-white')}
          >
            <Logo />
          </Link>

          <nav
            className={cn(
              'hidden items-center gap-8 lg:flex',
              'font-display text-[11.5px] font-medium uppercase tracking-[0.14em]',
              overlay ? 'text-white/80' : 'text-charcoal',
            )}
          >
            {primaryNav.map((item) => (
              <NavLink
                key={item.key}
                to={path(item.to)}
                className={cn(
                  'relative py-2 transition-colors hover:text-ink',
                  overlay ? 'hover:text-white' : 'hover:text-ink',
                  isActive(path(item.to)) && (overlay ? 'text-white' : 'text-ink'),
                )}
                aria-current={isActive(path(item.to)) ? 'page' : undefined}
              >
                {t(item.label)}
                {isActive(path(item.to)) && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-[1px] left-0 right-0 h-[2px]',
                      overlay ? 'bg-white' : 'bg-brandCrimson',
                    )}
                  />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher
            locale={locale}
            localeHref={localeHref}
            label={t(content.common.languageLabel)}
            overlay={overlay}
          />

          <Link
            to={path('/contact')}
            className={cn(
              'rounded-full border px-6 py-2.5 font-display text-[11.5px] font-medium uppercase tracking-[0.14em] transition-colors',
              overlay
                ? 'border-white/55 text-white hover:border-white hover:bg-white hover:text-ink'
                : 'border-ink/30 text-ink hover:border-brandBlue hover:text-brandBlue',
            )}
          >
            {t(content.home.hero.secondaryCta)}
          </Link>
        </div>

        <button
          type="button"
          className={cn(
            'p-2 -mr-2 transition-colors lg:hidden',
            overlay ? 'text-white' : 'text-ink',
          )}
          onClick={() => setOpen(true)}
          aria-label={t(content.common.menu)}
          aria-expanded={open}
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          // `overflow-hidden` clips the drawer while it is parked off-screen to
          // the right. Without it the translated panel widens the document and
          // the whole page can be dragged sideways on a phone.
          'fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={cn(
            'absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col border-l border-rule bg-white shadow-2xl transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t(content.common.menu)}
        >
          <div className="flex h-[76px] items-center justify-between border-b border-rule px-6">
            <Logo />
            <button
              type="button"
              className="-mr-2 p-2 text-ink"
              onClick={() => setOpen(false)}
              aria-label={t(content.common.close)}
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-8">
            <ul>
              {primaryNav.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={path(item.to)}
                    className={cn(
                      'block border-b border-rule py-5 font-editorial text-[26px] leading-tight transition-colors',
                      isActive(path(item.to)) ? 'text-brandBlue' : 'text-ink',
                    )}
                  >
                    {t(item.label)}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-rule pt-8">
              <div className="eyebrow mb-3 text-muted">{t(content.common.languageLabel)}</div>
              <LanguageSwitcher
                locale={locale}
                localeHref={localeHref}
                label={t(content.common.languageLabel)}
                stacked
              />
            </div>

            <Link
              to={path('/contact')}
              className="mt-8 inline-flex items-center justify-center bg-brandBlue px-6 py-3.5 font-display text-[12px] font-medium uppercase tracking-[0.12em] text-white"
            >
              {t(content.home.hero.secondaryCta)}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

/**
 * EN / 繁 / 简 switcher.
 *
 * Lives in the header rather than a footer because the market is trilingual —
 * a reader arriving on the Chinese page must be able to move between the
 * three without hunting.
 */
function LanguageSwitcher({ locale, localeHref, label, stacked = false, overlay = false }) {
  return (
    <nav
      aria-label={label}
      className={cn('flex items-center', stacked ? 'flex-wrap gap-2' : 'gap-1')}
    >
      {LOCALES.map((l) => {
        const active = l.code === locale;
        return (
          <Link
            key={l.code}
            to={localeHref(l.code)}
            hrefLang={l.htmlLang}
            aria-current={active ? 'true' : undefined}
            title={l.nameLocal}
            className={cn(
              'font-display text-[12px] px-2 py-1 transition-colors',
              overlay
                ? active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
                : active
                  ? 'font-semibold text-brandBlue'
                  : 'text-charcoal hover:text-ink',
            )}
          >
            {l.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
