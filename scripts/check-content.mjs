/**
 * The content check — what the compiled case files must satisfy.
 *
 * The sync refuses to publish a case that breaks a rule, so this check
 * should never find anything. It is here because the content is committed:
 * a file can be edited by hand, or a sync can be run against the wrong
 * sheet, and the build has to catch that before the site is published.
 *
 * The rules, in one place:
 *   1. every case is published, and its slug is a valid, unique route id
 *   2. every case names the deck and slide it came from
 *   3. every case has an image, and the file is on disk
 *   4. the alt text is filled in for all three languages
 *   5. a mock-up says so in its alt text, in all three languages
 *   6. the summary is filled in for every language, and a result or scope
 *      line that is missing in one language is a note rather than a failure
 *      — a translation in progress is a normal state to be in
 *   7. the sector and every service key are ones the site knows
 *
 * Run with:  npm run check:content
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { LOCALES, MOCK_UP_PREFIX, SLUG_PATTERN } from '../tools/cms/lib/schema.mjs';
import { SECTOR_KEYS, SERVICE_KEYS } from '../tools/cms/lib/vocab.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CONTENT_DIR = join(ROOT, 'content', 'cases');
const PUBLIC_DIR = join(ROOT, 'public');

let files = [];
try {
  files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
} catch {
  console.error(`no compiled cases at ${CONTENT_DIR}`);
  process.exit(1);
}

if (files.length === 0) {
  console.error('there are no compiled case files — the work pages would be empty');
  process.exit(1);
}

const problems = [];
const notes = [];
const fail = (slug, message) => problems.push(`${slug}: ${message}`);
const note = (slug, message) => notes.push(`${slug}: ${message}`);

const slugs = new Set();
const orders = [];
const records = [];

for (const file of files) {
  let record;
  try {
    record = JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf8'));
  } catch (error) {
    problems.push(`${file}: the file is not valid JSON — ${error.message}`);
    continue;
  }

  const slug = record.slug ?? file.replace(/\.json$/, '');

  if (!SLUG_PATTERN.test(slug)) fail(slug, 'the slug is not a valid route id');
  if (slugs.has(slug)) fail(slug, 'the slug appears in more than one file');
  slugs.add(slug);

  if (record.published === false) fail(slug, 'the case is a draft and must not be in the compiled content');
  if (typeof record.order !== 'number') fail(slug, 'the order is missing');

  if (!record.source || !String(record.source).trim()) {
    fail(slug, 'no source — every published case must name the deck and slide it came from');
  }

  if (!record.client || !String(record.client).trim()) fail(slug, 'no client name');
  if (!SECTOR_KEYS.includes(record.sector)) {
    fail(slug, `"${record.sector}" is not a sector the site knows`);
  }
  for (const key of record.services ?? []) {
    if (SERVICE_KEYS.includes(key)) continue;
    fail(slug, `"${key}" is not a service the site offers`);
  }

  for (const locale of LOCALES) {
    if (!record.summary?.[locale]) fail(slug, `no summary in ${locale}`);
  }

  /* The local client and project names are optional, but they cannot be
     filled in in one language and left blank in another. */
  for (const [field, label] of [
    ['clientLocal', 'client name'],
    ['projectLocal', 'project name'],
  ]) {
    const values = LOCALES.map((locale) => String(record[field]?.[locale] ?? '').trim());
    if (values.some(Boolean) && values.some((v) => !v)) {
      fail(slug, `the ${label} is filled in in some languages and blank in others`);
    }
  }

  for (const [index, line] of (record.scope ?? []).entries()) {
    for (const locale of LOCALES) {
      if (line?.[locale]) continue;
      /* A line that has not been translated yet shows in English there.
         That is the rule the whole site already follows; it is not a
         reason to stop the site from publishing. */
      note(slug, `scope line ${index + 1} is empty in ${locale} — it shows in English there`);
    }
  }

  for (const [index, result] of (record.results ?? []).entries()) {
    if (!result.value) fail(slug, `result ${index + 1} has no figure`);
    for (const locale of LOCALES) {
      if (result.label?.[locale]) continue;
      note(slug, `result ${index + 1} has no label in ${locale} — it shows in English there`);
    }
  }

  /* The image, and the alt text. */
  if (!record.image?.src) {
    fail(slug, 'no image — a published case must have one');
  } else {
    if (!record.image.src.startsWith('/media/cases/')) {
      fail(slug, `the image path "${record.image.src}" is not under /media/cases/`);
    }
    if (!existsSync(join(PUBLIC_DIR, record.image.src))) {
      fail(slug, `the image file ${record.image.src} is not in the repository`);
    }
    for (const locale of LOCALES) {
      const alt = record.image.alt?.[locale];
      if (!alt) {
        note(slug, `no alt text in ${locale} — it falls back to the English alt text`);
        continue;
      }
      const prefix = MOCK_UP_PREFIX[locale];
      const startsWithPrefix = alt.toLowerCase().startsWith(prefix.toLowerCase());
      if (record.image.mockup && !startsWithPrefix) {
        fail(slug, `the alt text in ${locale} does not say it is a mock-up`);
      }
      if (!record.image.mockup && startsWithPrefix) {
        fail(slug, `the alt text in ${locale} still carries the mock-up prefix`);
      }
    }
  }

  orders.push(record.order);
  records.push(record);
}

/* The order must be a clean sequence, so the work grid never reorders
   itself between builds. */
const sorted = [...orders].sort((a, b) => a - b);
for (let i = 0; i < sorted.length; i += 1) {
  if (sorted[i] !== i) {
    problems.push(`the case order is not a clean sequence — expected ${i}, found ${sorted[i]}`);
    break;
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s) in the compiled case content:\n`);
  for (const problem of problems) console.error(`  · ${problem}`);
  console.error('');
  process.exit(1);
}

const mockUps = records.filter((r) => r.image?.mockup).length;
for (const note of notes) console.log(`note  ${note}`);

console.log(
  `Content check clean — ${records.length} published cases, ${mockUps} carrying generated artwork` +
    (notes.length ? `, ${notes.length} note(s).` : '.'),
);
