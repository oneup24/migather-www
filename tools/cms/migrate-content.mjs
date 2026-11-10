/**
 * The one-off migration — the pre-CMS data modules into compiled content.
 *
 * Before the CMS, the 16 cases lived in `src/data/cases.js` and their images
 * in `src/data/media.js`. This script writes the compiled form the site now
 * reads:
 *
 *   content/cases/<slug>.json          one file per case, three locales merged
 *   public/media/cases/<slug>/<file>   the image, in the case's own folder
 *
 * It is kept in the repository so the migration can be re-run and checked
 * against the original source. After the switch it is superseded by
 * `sync-cases.mjs`, which does the same job from the sheet.
 *
 * Run with:  node tools/cms/migrate-content.mjs [--check]
 *
 *   --check   write nothing; report whether the compiled content is already
 *             what this script would produce.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { buildRecord, serialiseRecord } from './lib/records.mjs';
import { LOCALES } from './lib/schema.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DATA_DIR = join(ROOT, 'src', 'data');
const CONTENT_DIR = join(ROOT, 'content', 'cases');
const PUBLIC_CASES_DIR = join(ROOT, 'public', 'media', 'cases');
const CHECK_ONLY = process.argv.includes('--check');

/**
 * Import a data module in plain Node.
 *
 * The modules read `import.meta.env.BASE_URL`, which only exists inside a
 * Vite build. The token is swapped for a global so the module can be loaded
 * here; the base path is empty locally, so the paths come out unchanged.
 */
async function importDataModule(file) {
  globalThis.__MIGRATE_ENV__ = { BASE_URL: '' };
  const source = readFileSync(join(DATA_DIR, file), 'utf8').replace(
    /import\.meta\.env/g,
    'globalThis.__MIGRATE_ENV__',
  );
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  return import(url);
}

const legacy = await importDataModule('cases.js');
const media = await importDataModule('media.js');

if (!Array.isArray(legacy.cases)) {
  console.error(
    'src/data/cases.js no longer holds the case records — it is the loader over\n' +
      'content/cases/*.json now. The migration has already been done; use\n' +
      'tools/cms/sync-cases.mjs to pull new content from the sheet.',
  );
  process.exit(1);
}

if (!media.caseImages) {
  console.error(
    'src/data/media.js no longer holds the case images — they moved into the\n' +
      'case records. The migration has already been done.',
  );
  process.exit(1);
}

const records = [];
const images = [];

for (const [index, entry] of legacy.cases.entries()) {
  const image = media.caseImages[entry.slug] ?? null;
  const fileName = image ? image.src.split('/').pop() : null;

  records.push(
    buildRecord({
      slug: entry.slug,
      order: index,
      client: entry.client,
      // The local client name is one value used in every language, so it goes
      // into each of the three locales.
      clientLocal: Object.fromEntries(LOCALES.map((l) => [l, entry.clientLocal ?? ''])),
      projectLocal: Object.fromEntries(LOCALES.map((l) => [l, entry.projectLocal ?? ''])),
      sector: entry.sector,
      services: entry.services ?? [],
      partnershipSince: entry.partnershipSince ?? null,
      featured: Boolean(entry.featured),
      published: true,
      summary: entry.summary ?? {},
      results: (entry.results ?? []).map((result) => ({
        value: result.value,
        label: result.label ?? {},
        note: result.note ?? null,
      })),
      scope: (entry.scope ?? []).map((line) => (typeof line === 'string' ? { en: line } : line)),
      source: entry.source ?? '',
      image: image
        ? {
            src: `/media/cases/${entry.slug}/${fileName}`,
            alt: image.alt ?? {},
            mockup: true,
          }
        : null,
    }),
  );

  if (image && fileName) {
    images.push({
      from: join(ROOT, 'public', 'media', fileName),
      to: join(PUBLIC_CASES_DIR, entry.slug, fileName),
    });
  }
}

let changed = 0;
let unchanged = 0;

mkdirSync(CONTENT_DIR, { recursive: true });

for (const record of records) {
  const file = join(CONTENT_DIR, `${record.slug}.json`);
  const next = serialiseRecord(record);
  const current = existsSync(file) ? readFileSync(file, 'utf8') : null;

  if (current === next) {
    unchanged += 1;
    continue;
  }

  changed += 1;
  if (!CHECK_ONLY) writeFileSync(file, next, 'utf8');
  console.log(`${CHECK_ONLY ? 'would write' : 'wrote'} ${record.slug}.json`);
}

if (!CHECK_ONLY) {
  for (const image of images) {
    mkdirSync(join(image.to, '..'), { recursive: true });
    copyFileSync(image.from, image.to);
  }

  // The flat `public/media/case-*.jpg` files are superseded by the per-case
  // folders. They are removed so no stale copy is served by accident.
  for (const image of images) {
    const flat = join(ROOT, 'public', 'media', image.to.split('/').pop());
    if (existsSync(flat)) rmSync(flat);
  }
}

console.log(
  `\n${records.length} cases — ${changed} to write, ${unchanged} already current.` +
    (CHECK_ONLY ? ' (check only, nothing written)' : '') +
    `\n${images.length} images ${CHECK_ONLY ? 'would be copied' : 'copied'} into public/media/cases/.`,
);
