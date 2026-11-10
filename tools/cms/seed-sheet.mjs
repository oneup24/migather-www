/**
 * The seed — the one-off migration into the sheet and the Drive folder.
 *
 * It pushes the 16 existing cases into the sheet and their images into the
 * Drive folder, with `mockup: true` and `published: true`. After that the
 * sheet is the source of truth and the sync pulls from it.
 *
 * It is re-runnable and it never clobbers: a case whose slug is already in
 * a tab is left alone, so a sheet an editor has already worked on is not
 * overwritten by a second run of the seed.
 *
 * Usage:
 *   node tools/cms/seed-sheet.mjs --spreadsheet <id> --drive-folder <id> \
 *        --credentials ./service-account.json
 *
 *   node tools/cms/seed-sheet.mjs --fixtures ./fixtures
 *
 * The `--fixtures` mode writes the nine tabs and the images to a local
 * directory instead of Google. That directory is what the sync's dry run
 * reads, which is how the migration is proved lossless: the same cases go
 * in as tabs and come back out as byte-identical case files.
 */
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import {
  recordToCaseRows,
  recordToResultRows,
  recordToScopeRows,
  rowToArray,
} from './lib/records.mjs';
import {
  CASE_COLUMNS,
  CASE_TABS,
  LOCALES,
  PUBLIC_CASE_IMAGE_DIR,
  RESULT_COLUMNS,
  RESULT_TABS,
  SCOPE_COLUMNS,
  SCOPE_TABS,
} from './lib/schema.mjs';
import {
  WRITE_SCOPES,
  addTab,
  appendRange,
  createFolder,
  deleteTab,
  getAccessToken,
  listFolder,
  loadCredentials,
  readRanges,
  spreadsheetTabs,
  uploadFile,
  writeRange,
} from './lib/google.mjs';
import { SECTOR_KEYS, SERVICE_KEYS } from './lib/vocab.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CONTENT_PATH = join(ROOT, 'content', 'cases');
const PUBLIC_CASES_PATH = join(ROOT, PUBLIC_CASE_IMAGE_DIR);

/** The tab the Apps Script reads the editor allow-list from. */
const SETTINGS_TAB = 'settings';
const SETTINGS_COLUMNS = ['key', 'value'];

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
  dryRun: argv.includes('--dry-run'),
  /* The settings the seed writes into the settings tab. */
  editors: argOf('--editors') ?? '',
  githubOwner: argOf('--github-owner') ?? '',
  githubRepo: argOf('--github-repo') ?? '',
};

/* ── The records to seed ──────────────────────────────────────────────── */

const files = readdirSync(CONTENT_PATH).filter((f) => f.endsWith('.json'));
const records = files
  .map((file) => JSON.parse(readFileSync(join(CONTENT_PATH, file), 'utf8')))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

if (records.length === 0) {
  console.error('there are no compiled cases to seed — run tools/cms/migrate-content.mjs first');
  process.exit(1);
}

/* ── The tabs ─────────────────────────────────────────────────────────── */

/** The nine content tabs. */
const ALL_CONTENT_TABS = [
  ...LOCALES.map((l) => CASE_TABS[l]),
  ...LOCALES.map((l) => RESULT_TABS[l]),
  ...LOCALES.map((l) => SCOPE_TABS[l]),
];

/** Which tab is this, and which locale does it hold? */
function tabInfo(tab) {
  for (const locale of LOCALES) {
    if (tab === CASE_TABS[locale]) return { kind: 'cases', locale, columns: CASE_COLUMNS };
    if (tab === RESULT_TABS[locale]) return { kind: 'results', locale, columns: RESULT_COLUMNS };
    if (tab === SCOPE_TABS[locale]) return { kind: 'scope', locale, columns: SCOPE_COLUMNS };
  }
  throw new Error(`unknown tab ${tab}`);
}

/** The rows a tab should hold, for one locale. */
function rowsForTab(tab) {
  const { kind, locale } = tabInfo(tab);

  if (kind === 'cases') return records.map((record) => recordToCaseRows(record, locale));
  if (kind === 'results') return records.flatMap((record) => recordToResultRows(record, locale));
  return records.flatMap((record) => recordToScopeRows(record, locale));
}

/* ── The fixture mode ─────────────────────────────────────────────────── */

/** Write the nine tabs and the images to a local directory. */
function seedFixtures(directory) {
  mkdirSync(directory, { recursive: true });

  for (const tab of ALL_CONTENT_TABS) {
    const { columns } = tabInfo(tab);
    const rows = rowsForTab(tab);
    const values = [columns, ...rows.map((row) => rowToArray(row, columns))];
    writeFileSync(join(directory, `${tab}.json`), `${JSON.stringify(values, null, 2)}\n`, 'utf8');
  }

  for (const record of records) {
    if (!record.image) continue;
    const file = record.image.src.split('/').pop();
    const source = join(PUBLIC_CASES_PATH, record.slug, file);
    const destination = join(directory, 'media', record.slug, file);
    mkdirSync(join(destination, '..'), { recursive: true });
    copyFileSync(source, destination);
  }

  console.log(`Fixtures written to ${directory}`);
  console.log(
    `  ${ALL_CONTENT_TABS.length} tabs, ${records.length} cases, ${records.length} image folders.`,
  );
}

/* ── The Google mode ──────────────────────────────────────────────────── */

/** The slugs already present in a tab. */
function slugsIn(values) {
  const slugs = new Set();
  for (const row of values.slice(1)) {
    const slug = row?.[0];
    if (slug) slugs.add(slug);
  }
  return slugs;
}

async function seedGoogle() {
  const key = loadCredentials(OPTIONS.credentials);
  const token = await getAccessToken(key, WRITE_SCOPES);

  /* The tabs. */
  const tabs = await spreadsheetTabs(OPTIONS.spreadsheet, token);

  for (const tab of [...ALL_CONTENT_TABS, SETTINGS_TAB]) {
    if (tabs.some((existing) => existing.title === tab)) continue;
    await addTab(OPTIONS.spreadsheet, token, tab);
    console.log(`created the tab ${tab}`);
  }

  /* The blank tab a new spreadsheet comes with. It is left alone if it holds
     anything — the seed never destroys work — but an empty "Sheet1" beside
     nine content tabs only confuses an editor. */
  const contentTabs = [...ALL_CONTENT_TABS, SETTINGS_TAB];
  for (const tab of tabs) {
    if (contentTabs.includes(tab.title)) continue;
    const values = await readRanges(OPTIONS.spreadsheet, token, [tab.title]);
    if ((values[tab.title] ?? []).length > 0) continue;
    await deleteTab(OPTIONS.spreadsheet, token, tab.sheetId);
    console.log(`removed the empty tab ${tab.title}`);
  }

  /* The content. */
  const values = await readRanges(OPTIONS.spreadsheet, token, ALL_CONTENT_TABS);

  for (const tab of ALL_CONTENT_TABS) {
    const { columns } = tabInfo(tab);
    const rows = rowsForTab(tab);
    const current = values[tab] ?? [];

    if (current.length === 0) {
      /* An empty tab needs its header before anything else. */
      await writeRange(OPTIONS.spreadsheet, token, tab, [columns]);
      console.log(`wrote the header of ${tab}`);
    }

    const present = slugsIn(current);
    const missing = rows.filter((row) => !present.has(row.slug));

    if (missing.length === 0) {
      console.log(`${tab}: already seeded`);
      continue;
    }

    /* A case is seeded whole: if its slug is already in the tab, its
       results and scope lines are left alone as well. */
    await appendRange(
      OPTIONS.spreadsheet,
      token,
      tab,
      missing.map((row) => rowToArray(row, columns)),
    );
    console.log(`${tab}: appended ${missing.length} row(s)`);
  }

  /* The settings tab: the editor allow-list, and the vocabulary the form
     offers. The vocabulary rows are machine-managed — the seed refreshes
     them from the site's own taxonomy, so the form cannot offer a service
     or a sector the site does not have. */
  const settings = await readRanges(OPTIONS.spreadsheet, token, [SETTINGS_TAB]);
  const current = settings[SETTINGS_TAB] ?? [];

  if (current.length === 0) {
    await writeRange(OPTIONS.spreadsheet, token, SETTINGS_TAB, [
      SETTINGS_COLUMNS,
      ['editors', OPTIONS.editors],
      ['github_owner', OPTIONS.githubOwner],
      ['github_repo', OPTIONS.githubRepo],
      ['sectors', JSON.stringify(SECTOR_KEYS)],
      ['services', JSON.stringify(SERVICE_KEYS)],
    ]);
    console.log('wrote the settings tab — put the editor emails in the `editors` row');
  } else {
    const header = current[0];
    const keyIndex = header.indexOf('key');
    const valueIndex = header.indexOf('value');
    const rows = current.slice(1).map((row) => [row[keyIndex], row[valueIndex]]);

    for (const [key, value] of [
      ['sectors', JSON.stringify(SECTOR_KEYS)],
      ['services', JSON.stringify(SERVICE_KEYS)],
      ['editors', OPTIONS.editors],
      ['github_owner', OPTIONS.githubOwner],
      ['github_repo', OPTIONS.githubRepo],
    ]) {
      if (!value) continue;
      const existing = rows.find((row) => row[0] === key);
      if (existing) existing[1] = value;
      else rows.push([key, value]);
    }

    await writeRange(OPTIONS.spreadsheet, token, SETTINGS_TAB, [header, ...rows]);
    console.log('refreshed the vocabulary in the settings tab');
  }

  /* The Drive folders and the images. */
  const folders = await listFolder(token, OPTIONS.driveFolder);
  const folderByName = new Map(folders.map((f) => [f.name, f]));

  for (const record of records) {
    if (!record.image) continue;
    const file = record.image.src.split('/').pop();
    const source = join(PUBLIC_CASES_PATH, record.slug, file);

    let folder = folderByName.get(record.slug);
    if (!folder) {
      folder = await createFolder(token, OPTIONS.driveFolder, record.slug);
      folderByName.set(record.slug, folder);
      console.log(`created the Drive folder ${record.slug}`);
    }

    const inside = await listFolder(token, folder.id);
    if (inside.some((f) => f.name === file)) {
      console.log(`${record.slug}: the image is already in Drive`);
      continue;
    }

    await uploadFile(token, folder.id, file, readFileSync(source), 'image/jpeg');
    console.log(`${record.slug}: uploaded ${file}`);
  }
}

/* ── Run ──────────────────────────────────────────────────────────────── */

console.log('Migrather sheet seed\n');

if (OPTIONS.fixtures) {
  seedFixtures(OPTIONS.fixtures);
  process.exit(0);
}

if (OPTIONS.dryRun) {
  console.log('Dry run — nothing was written.\n');
  for (const tab of ALL_CONTENT_TABS) {
    console.log(`  ${tab}: ${rowsForTab(tab).length} row(s) would be written`);
  }
  process.exit(0);
}

await seedGoogle();

console.log('\nThe sheet is seeded. The editor can now work in the form.\n');
