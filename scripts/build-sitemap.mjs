/**
 * Sitemap generator.
 *
 * Builds `public/sitemap.xml` from the route table and the published cases,
 * so the sitemap can never drift from the routes the site actually serves.
 *
 * The case slugs come from the compiled content in `content/cases/`, which
 * is what the site itself reads. They used to be scraped out of the data
 * module with a regex, which broke the moment the cases became files.
 *
 * Run with:  npm run build:sitemap
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DATA_DIR = join(ROOT, 'src', 'data');
const CONTENT_DIR = join(ROOT, 'content', 'cases');

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

/** The published cases, in the order the sheet lists them. */
function readCases() {
  let files = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }

  return files
    .map((file) => JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf8')))
    .filter((record) => record.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Pull the service keys out of the service menu. The module is plain
 *  JavaScript with no dependencies, so it can simply be imported. */
const { allServices } = await import(join(DATA_DIR, 'services.js'));

const cases = readCases();
const slugs = cases.map((record) => record.slug);
const serviceKeys = allServices.map((service) => service.key);

const urls = [];
for (const locale of LOCALES) {
  for (const p of STATIC_PATHS) {
    urls.push(`/${locale}${p}`);
  }
  for (const slug of slugs) {
    urls.push(`/${locale}/work/${slug}`);
  }
  for (const key of serviceKeys) {
    urls.push(`/${locale}/services/${key}`);
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

console.log(
  `sitemap.xml written — ${urls.length} URLs (${LOCALES.length} locales, ${slugs.length} cases, ${serviceKeys.length} services).`,
);
