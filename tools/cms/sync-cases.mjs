/**
 * The sync — pull the sheet, validate it, compile it, commit it.
 *
 * This is the read path of the CMS. It runs in GitHub Actions when an
 * editor presses "Save & publish", and it can be run by hand with
 * `--fixtures` against a local copy of the sheet.
 *
 * The shape of the pipeline matters:
 *
 *     pull  →  validate  →  compile  →  write
 *
 * A failure at any step stops the pipeline, and nothing is written. The
 * site therefore never depends on Google being up: `content/cases/` and
 * `public/media/cases/` are committed, and a broken sheet leaves the last
 * good content in place.
 *
 * Usage:
 *   node tools/cms/sync-cases.mjs --fixtures ./fixtures
 *   node tools/cms/sync-cases.mjs --spreadsheet <id> --drive-folder <id> \
 *        --credentials ./service-account.json
 *
 * Options:
 *   --spreadsheet <id>    the sheet id           ($CMS_SPREADSHEET_ID)
 *   --drive-folder <id>   the Drive folder id    ($CMS_DRIVE_FOLDER_ID)
 *   --credentials <path>  the service-account key file or the key itself
 *                         ($GCP_SERVICE_ACCOUNT_JSON)
 *   --fixtures <dir>      read the tabs and the images from a local
 *                         directory instead of Google
 *   --dry-run             validate and report; write nothing
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { compile, formatError } from './lib/compile.mjs';
import { serialiseRecord } from './lib/records.mjs';
import {
  CASE_TABS,
  CONTENT_DIR,
  IMAGE_MAX_WIDTH,
  LOCALES,
  PUBLIC_CASE_IMAGE_DIR,
  RESULT_TABS,
  SCOPE_TABS,
} from './lib/schema.mjs';
import { SECTOR_KEYS, SERVICE_KEYS } from './lib/vocab.mjs';
import {
  downloadFile,
  getAccessToken,
  listFolder,
  loadCredentials,
  readRanges,
} from './lib/google.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CONTENT_PATH = join(ROOT, CONTENT_DIR);
const PUBLIC_CASES_PATH = join(ROOT, PUBLIC_CASE_IMAGE_DIR);
const RESIZE_SCRIPT = join(ROOT, 'tools', 'cms', 'resize.py');

/* ── The command line ─────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const argOf = (flag) => {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
};

const OPTIONS = {
  spreadsheet: argOf('--spreadsheet') ?? process.env.CMS_SPREADSHEET_ID,
  driveFolder: argOf('--drive-folder') ?? process.env.CMS_DRIVE_FOLDER_ID,
  credentials: argOf('--credentials') ?? process.env.GCP_SERVICE_ACCOUNT_JSON,
  fixtures: argOf('--fixtures'),
  dryRun: argv.includes('--dry-run') || argv.includes('--check'),
};

/* ── 1. Pull ──────────────────────────────────────────────────────────── */

/** The nine tab names, in the order they are read. */
const TAB_NAMES = [
  ...LOCALES.map((l) => CASE_TABS[l]),
  ...LOCALES.map((l) => RESULT_TABS[l]),
  ...LOCALES.map((l) => SCOPE_TABS[l]),
];

/**
 * Read the nine tabs.
 *
 * From Google, the tabs are read in one batch call. From a fixture
 * directory, each tab is a JSON file holding the same array-of-arrays the
 * Sheets API returns — so a dry run exercises the same code as the real
 * thing.
 */
async function pullTabs() {
  if (OPTIONS.fixtures) {
    const values = {};
    for (const tab of TAB_NAMES) {
      const file = join(OPTIONS.fixtures, `${tab}.json`);
      values[tab] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
    }
    return values;
  }

  if (!OPTIONS.spreadsheet) {
    throw new Error(
      'no spreadsheet — pass --spreadsheet <id> or set CMS_SPREADSHEET_ID',
    );
  }

  const key = loadCredentials(OPTIONS.credentials);
  const token = await getAccessToken(key);
  return readRanges(OPTIONS.spreadsheet, token, TAB_NAMES);
}

/**
 * Read the images.
 *
 * From Google, each case's image is downloaded from its own Drive folder —
 * the folder is named after the slug, the file after the `image` column.
 * From a fixture directory, the images sit in `media/<slug>/<file>`.
 */
/**
 * The pictures, downloaded from Drive.
 *
 * A picture that is not there is not a reason to stop the site. The case
 * keeps the picture it already has — which is in the repository — and the
 * run says so. A broken picture on a live page is worse than a picture that
 * did not change.
 */
async function pullImages(records, warnings) {
  const images = new Map();

  /** The picture a case already has, so it can be kept if the new one is missing. */
  const committed = new Map();
  for (const record of records) {
    const file = join(CONTENT_PATH, `${record.slug}.json`);
    if (!existsSync(file)) continue;
    try {
      const previous = JSON.parse(readFileSync(file, 'utf8'));
      if (previous.image?.src) committed.set(record.slug, previous.image.src.split('/').pop());
    } catch {
      /* A file that cannot be read simply has no previous picture. */
    }
  }

  if (OPTIONS.fixtures) {
    for (const record of records) {
      if (!record.image) continue;
      const file = record.image.src.split('/').pop();
      const path = join(OPTIONS.fixtures, 'media', record.slug, file);
      if (!existsSync(path)) {
        warnings.push(`the fixture for ${record.slug} is missing ${file}`);
        continue;
      }
      images.set(record.slug, { path, file });
    }
    return images;
  }

  if (!OPTIONS.driveFolder) {
    throw new Error('no Drive folder — pass --drive-folder <id> or set CMS_DRIVE_FOLDER_ID');
  }

  const key = loadCredentials(OPTIONS.credentials);
  const token = await getAccessToken(key);

  const folders = await listFolder(token, OPTIONS.driveFolder);
  const folderByName = new Map(folders.map((f) => [f.name, f]));

  for (const record of records) {
    if (!record.image) continue;
    const file = record.image.src.split('/').pop();

    const folder = folderByName.get(record.slug);
    if (!folder) {
      warnings.push(
        `the Drive folder for ${record.slug} does not exist — the case keeps the picture it has`,
      );
      continue;
    }

    const files = await listFolder(token, folder.id);
    const source = files.find((f) => f.name === file);
    if (!source) {
      const previous = committed.get(record.slug);
      warnings.push(
        `the Drive folder for ${record.slug} has no file called ${file}` +
          (previous
            ? ` — the case keeps ${previous.src.split('/').pop()} until the new picture is there`
            : ' — the case has no picture to keep'),
      );
      continue;
    }

    const bytes = await downloadFile(token, source.id);
    const tmp = join(ROOT, '.cms-tmp', record.slug, file);
    mkdirSync(join(tmp, '..'), { recursive: true });
    writeFileSync(tmp, bytes);
    images.set(record.slug, { path: tmp, file });
  }

  return images;
}

/** The picture a case already has, in the repository — the whole thing. */
function previousImage(slug) {
  const file = join(CONTENT_PATH, `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const previous = JSON.parse(readFileSync(file, 'utf8'));
    if (!previous.image?.src) return null;
    return previous.image;
  } catch {
    return null;
  }
}

/* ── 2. Write ─────────────────────────────────────────────────────────── */

/** Size an image to the width the site serves it at. */
function resizeImage(source, destination) {
  const result = spawnSync('python3', [RESIZE_SCRIPT, source, destination, String(IMAGE_MAX_WIDTH)], {
    encoding: 'utf8',
  });

  if (result.error) {
    throw new Error(`could not run python3: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(`could not resize ${source}\n${detail}`);
  }
  if (result.stdout.trim()) console.log(result.stdout.trim());
}

/** Write the compiled case files, and remove the ones that are no longer published. */
function writeContent(records, images) {
  mkdirSync(CONTENT_PATH, { recursive: true });

  const written = [];
  const unchanged = [];

  for (const record of records) {
    const file = join(CONTENT_PATH, `${record.slug}.json`);
    const next = serialiseRecord(record);
    const current = existsSync(file) ? readFileSync(file, 'utf8') : null;

    if (current === next) {
      unchanged.push(record.slug);
    } else {
      writeFileSync(file, next, 'utf8');
      written.push(record.slug);
    }
  }

  /* A case that is no longer published must not stay on the site. */
  const removed = [];
  const keep = new Set(records.map((r) => r.slug));
  for (const file of readdirSync(CONTENT_PATH)) {
    if (!file.endsWith('.json')) continue;
    const slug = file.replace(/\.json$/, '');
    if (keep.has(slug)) continue;
    rmSync(join(CONTENT_PATH, file));
    removed.push(slug);
  }

  /* The images. */
  const imagesWritten = [];
  for (const record of records) {
    const image = images.get(record.slug);
    if (!image) continue;

    const destination = join(PUBLIC_CASES_PATH, record.slug, image.file);
    mkdirSync(join(destination, '..'), { recursive: true });
    resizeImage(image.path, destination);
    imagesWritten.push(record.slug);
  }

  /* An image folder for a case that is no longer published goes too. */
  if (existsSync(PUBLIC_CASES_PATH)) {
    for (const folder of readdirSync(PUBLIC_CASES_PATH)) {
      if (keep.has(folder)) continue;
      rmSync(join(PUBLIC_CASES_PATH, folder), { recursive: true, force: true });
    }
  }

  return { written, unchanged, removed, imagesWritten };
}

/* ── 3. Run ───────────────────────────────────────────────────────────── */

console.log('Migrather content sync\n');

const tabs = await pullTabs();

const byLocale = (tabMap) =>
  Object.fromEntries(LOCALES.map((locale) => [locale, tabs[tabMap[locale]] ?? []]));

const imageWarnings = [];

const { records, errors, warnings } = compile(
  {
    cases: byLocale(CASE_TABS),
    results: byLocale(RESULT_TABS),
    scope: byLocale(SCOPE_TABS),
  },
  { sectors: SECTOR_KEYS, services: SERVICE_KEYS },
);

for (const warning of warnings) {
  console.log(`note  ${warning.slug}: ${warning.message}`);
}

if (errors.length > 0) {
  console.error(`\nThe sheet is not publishable — ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(formatError(error));
  console.error(
    '\nNothing was written. The site keeps the last good content until these are fixed.\n',
  );
  process.exit(1);
}

console.log(`\n${records.length} published case(s) compiled cleanly.`);

if (OPTIONS.dryRun) {
  console.log('\nDry run — nothing was written.\n');
  for (const record of records) {
    console.log(`  ${record.slug}  ${record.client}  [${record.sector}]`);
  }
  process.exit(0);
}

  const images = await pullImages(records, imageWarnings);
  for (const warning of imageWarnings) console.log(`note  ${warning}`);

  /* A case whose picture could not be downloaded keeps the picture it has.
     The whole picture comes back — the file, the alt text and the mock-up
     flag — because the flag and the alt text describe the picture, not the
     case. Keeping the new flag with the old picture would put generated
     artwork on the page with no mock-up label on it, which is the one thing
     the labelling exists to prevent. */
  for (const record of records) {
    if (images.has(record.slug)) continue;
    if (!record.image) continue;
    const previous = previousImage(record.slug);
    if (!previous) continue;

    /* The sheet says the new picture is not a mock-up, but the picture
       that is really there is the old one. Say so loudly: the site is
       showing the old picture, still labelled as a mock-up, and that is
       right — but the editor should know their new picture has not
       arrived. */
    if (previous.mockup !== record.image.mockup) {
      imageWarnings.push(
        `the sheet says the picture for ${record.slug} is ` +
          `${record.image.mockup ? 'a mock-up' : 'real photography'}, but the picture that is ` +
          `there is the old one — the site is showing the old picture, still labelled as a ` +
          `${previous.mockup ? 'mock-up' : 'photograph'}`,
      );
    }

    record.image = previous;
  }

  const result = writeContent(records, images);

  /* The download scratch space is not a deliverable. */
  rmSync(join(ROOT, '.cms-tmp'), { recursive: true, force: true });

  console.log(
    `\n${result.written.length} case file(s) written, ${result.unchanged.length} unchanged.` +
    (result.removed.length ? ` ${result.removed.length} removed.` : '') +
    `\n${result.imagesWritten.length} image(s) written to ${PUBLIC_CASE_IMAGE_DIR}/.`,
  );

if (result.written.length === 0 && result.removed.length === 0) {
  console.log('\nNothing changed — the workflow will not make a commit.\n');
} else {
  console.log('\nThe content has changed — commit it and the site publishes it.\n');
}
