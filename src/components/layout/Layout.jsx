import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { content } from '../../data/content';
import { useLocale } from '../../hooks/useLocale';
import CaptureMode from './CaptureMode';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

/** Scrolls to the top of the document on route change (but not on hash links). */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

/** Keeps the document language in step with the URL locale. */
function DocumentLang() {
  const { htmlLang } = useLocale();

  useEffect(() => {
    document.documentElement.lang = htmlLang;
  }, [htmlLang]);

  return null;
}

export default function Layout() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollManager />
      <DocumentLang />
      <CaptureMode />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-brandBlue focus:text-white focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm"
      >
        {t(content.common.skipToContent)}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
