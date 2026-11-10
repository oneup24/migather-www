/**
 * Sitemap generator.
 *
 * Builds `public/sitemap.xml` from the route table and the case slugs, so
 * the sitemap can never drift from the routes the site actually serves.
 *
 * Run with:  npm run build:sitemap
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DATA_DIR = join(ROOT, 'src', 'data');

const SITE_URL = 'https://migather.com';
const LOCALES = ['en', 'zh-Hant', 'zh-Hans'];

const STATIC_PATHS = [
  '',
  '/work',
  '/services',
  '/about',
  '/careers',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
  '/legal/disclosure',
];

/** Pull the case slugs straight out of the data module. */
function readCaseSlugs() {
  const source = readFileSync(join(DATA_DIR, 'cases.js'), 'utf8');
  return [...source.matchAll(/^\s{4}slug: '([^']+)',/gm)].map((m) => m[1]);
}

const slugs = readCaseSlugs();

const urls = [];
for (const locale of LOCALES) {
  for (const p of STATIC_PATHS) {
    urls.push(`/${locale}${p}`);
  }
  for (const slug of slugs) {
    urls.push(`/${locale}/work/${slug}`);
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8');

console.log(`sitemap.xml written — ${urls.length} URLs (${LOCALES.length} locales, ${slugs.length} cases).`);
