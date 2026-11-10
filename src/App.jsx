import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import WorkDetailPage from './pages/WorkDetailPage';
import WorkIndexPage from './pages/WorkIndexPage';
import { DEFAULT_LOCALE, isLocale } from './data/i18n';
import { LocaleProvider, useLocale } from './hooks/useLocale';

/**
 * The full route table — 9 page templates, served under a locale prefix.
 *
 * Paths are RELATIVE to the `/:locale` segment: React Router requires a
 * child of a pathed parent to declare its path relative to that parent.
 *
 * URLs are locale-prefixed (`/en/work`, `/zh-Hant/work`) rather than
 * locale-in-state, so each language has its own indexable address and a
 * link can be shared in any language. English is the default locale.
 *
 * Exported so the route-render check (scripts/ssr-check.jsx) exercises the
 * exact same table the app uses.
 */
export const pageRoutes = [
  { path: '/', index: true, element: <HomePage /> },
  { path: 'work', element: <WorkIndexPage /> },
  { path: 'work/:slug', element: <WorkDetailPage /> },
  { path: 'services', element: <ServicesPage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'careers', element: <CareersPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'legal/:doc', element: <LegalPage /> },
];

/** The page table as route elements, ready to be dropped into a <Routes>. */
export const pageRouteElements = pageRoutes.map((route) => (
  <Route
    key={route.path}
    index={route.index || undefined}
    path={route.index ? undefined : route.path}
    element={route.element}
  />
));

/**
 * Wraps a locale segment and provides the locale to everything below it.
 * An unknown locale segment renders the 404 page in the default language
 * rather than redirecting — a wrong URL should look wrong.
 */
export function LocaleShell() {
  const { locale } = useParams();
  const valid = isLocale(locale);

  return (
    <LocaleProvider locale={valid ? locale : DEFAULT_LOCALE}>
      <Layout />
    </LocaleProvider>
  );
}

/**
 * The old /capabilities address, kept alive.
 *
 * The page was renamed to Services in November 2026 and the URL with it.
 * Anything already pointing at the old address — the published preview, a
 * bookmark, a search result — is sent to the new one rather than to the
 * 404 page.
 */
export function LegacyServicesRedirect() {
  const { locale } = useLocale();
  return <Navigate to={`/${locale}/services`} replace />;
}

export default function App() {
  // When the site is published under a sub-path (GitHub Pages project sites
  // live at /<repo>/...), the router has to be told where the app starts, or
  // every route 404s. BASE_URL comes from Vite's `base` config, so the two
  // can never disagree. Locally BASE_URL is '/', and the basename is ''.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />

        <Route path="/:locale" element={<LocaleShell />}>
          {pageRouteElements}
          <Route path="capabilities" element={<LegacyServicesRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
