/**
 * Route render check.
 *
 * Renders every route in the real router to static HTML and asserts that each
 * one produces its own heading — i.e. that no route silently falls through to
 * the 404 page, and that no page throws during render.
 *
 * The site is locale-prefixed, so every route is checked in all three
 * languages: a translation gap that throws would otherwise only surface in
 * production.
 *
 * Run with:  npm run check:routes
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { pageRouteElements, LocaleShell } from '../src/App.jsx';
import { LOCALE_CODES } from '../src/data/i18n.js';
import { scanText } from './compliance-lists.mjs';

const SUB_PATHS = [
  '/',
  '/work',
  '/work/huatai-finance-hk',
  '/work/11-skies-gba-forum',
  '/work/christies-auction',
  // A case with no results and a local client name — the shape a newly
  // published case usually has.
  '/work/chinachem',
  '/services',
  '/services/community',
  '/services/kol',
  '/services/creative-content',
  '/about',
  '/careers',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
  '/legal/disclosure',
];

const NOT_FOUND_PATH = '/this-route-does-not-exist';

const CHECK = [];
for (const locale of LOCALE_CODES) {
  for (const sub of SUB_PATHS) {
    CHECK.push(`/${locale}${sub === '/' ? '' : sub}`);
  }
}
CHECK.push(`/${LOCALE_CODES[0]}${NOT_FOUND_PATH}`);

const strip = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

let failures = 0;
let copyHits = 0;

for (const path of CHECK) {
  const is404Case = path.endsWith(NOT_FOUND_PATH);
  const locale = path.split('/')[1];

  try {
    // Mirrors App.jsx exactly: a locale segment wrapping the page table.
    const html = renderToString(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:locale" element={<LocaleShell />}>
            {pageRouteElements}
            <Route path="*" element={<h1>NOT_FOUND_MARKER</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const heading = h1Match ? strip(h1Match[1]) : '(no h1)';
    const is404 = heading.includes('NOT_FOUND_MARKER');

    /* ── The copy the reader actually sees ──────────────────────────────
       `check:copy` screens the data modules. This screens the rendered
       text of the route, which is the only place a banned term hard-coded
       into a component would show up. */
    for (const hit of scanText(strip(html))) {
      copyHits += 1;
      console.log(`FAIL ${path.padEnd(44)} ${hit.kind} "${hit.segment.slice(0, 90)}"`);
    }

    if (is404Case) {
      if (is404) {
        console.log(`ok   ${path.padEnd(44)} -> 404 page (expected)`);
      } else {
        failures += 1;
        console.log(`FAIL ${path.padEnd(44)} -> expected the 404 page, got "${heading}"`);
      }
      continue;
    }

    if (is404) {
      failures += 1;
      console.log(`FAIL ${path.padEnd(44)} -> fell through to 404`);
    } else if (!h1Match) {
      failures += 1;
      console.log(`FAIL ${path.padEnd(44)} -> no h1 rendered`);
    } else if (html.length < 500) {
      failures += 1;
      console.log(`FAIL ${path.padEnd(44)} -> suspiciously small output`);
    } else {
      console.log(`ok   ${path.padEnd(44)} h1: ${heading.slice(0, 48)}`);
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL ${path.padEnd(44)} -> threw: ${error.message}`);
  }
}

console.log(
  failures === 0
    ? `\nAll ${CHECK.length} route renders passed (${LOCALE_CODES.length} locales).`
    : `\n${failures} route(s) failed.`,
);

if (copyHits === 0) {
  console.log(
    `Rendered-copy screen clean — ${CHECK.length} routes scanned for banned terms in every locale.`,
  );
} else {
  console.log(`\n${copyHits} banned term(s) found in rendered copy.`);
}

process.exit(failures === 0 && copyHits === 0 ? 0 : 1);
