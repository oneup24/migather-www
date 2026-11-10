/**
 * A test harness for the Apps Script.
 *
 * The form's server side cannot be run in Node — it reaches for
 * `SpreadsheetApp`, `DriveApp` and the rest. This mocks them, so the parts
 * that matter can be tested: a new case, an edited case, and the rule that
 * the locale-independent fields are written into all three tabs.
 *
 * Run with:  node tools/cms/test-apps-script.mjs
 *
 * It prints one line per check and exits non-zero if any of them fail.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

/* ── The fake sheet ───────────────────────────────────────────────────── */

/** A tab: an array of rows, each an array of strings. */
function makeTab(rows = []) {
  return {
    rows: rows.map((row) => row.map((cell) => String(cell ?? ''))),
    getDataRange() {
      return {
        getValues: () => this.rows.map((row) => row.slice()),
      };
    },
    getRange(row, column, numRows = 1, numColumns = 1) {
      return {
        setValues: (values) => {
          for (let r = 0; r < numRows; r += 1) {
            const target = row - 1 + r;
            while (this.rows.length <= target) this.rows.push([]);
            const line = this.rows[target];
            while (line.length < column - 1 + numColumns) line.push('');
            for (let c = 0; c < numColumns; c += 1) {
              line[column - 1 + c] = String(values[r][c] ?? '');
            }
          }
        },
      };
    },
    getLastRow() {
      return this.rows.length;
    },
    clearContents() {
      this.rows = [];
    },
  };
}

/** The whole spreadsheet: tabs by name. */
function makeSheet(tabs) {
  const sheet = {
    tabs,
    getSheetByName(name) {
      return tabs[name] ?? null;
    },
    createSheet(name) {
      tabs[name] = makeTab();
      return tabs[name];
    },
  };
  return sheet;
}

/* ── The mocks ────────────────────────────────────────────────────────── */

const CASE_COLUMNS = [
  'slug', 'client', 'clientLocal', 'projectLocal', 'sector', 'services',
  'partnershipSince', 'summary', 'imageAlt', 'image', 'mockup', 'source',
  'featured', 'published',
];

function buildSheet(cases) {
  const tabs = {};
  for (const tab of ['cases_EN', 'cases_ZH-HANT', 'cases_ZH-HANS']) {
    tabs[tab] = makeTab([CASE_COLUMNS]);
  }
  for (const tab of ['results_EN', 'results_ZH-HANT', 'results_ZH-HANS']) {
    tabs[tab] = makeTab([['slug', 'order', 'value', 'label', 'note']]);
  }
  for (const tab of ['scope_EN', 'scope_ZH-HANT', 'scope_ZH-HANS']) {
    tabs[tab] = makeTab([['slug', 'order', 'text']]);
  }
  for (const [slug, values] of Object.entries(cases)) {
    for (const tab of ['cases_EN', 'cases_ZH-HANT', 'cases_ZH-HANS']) {
      tabs[tab].rows.push(CASE_COLUMNS.map((column) => values[column] ?? ''));
    }
  }
  return makeSheet(tabs);
}

/** The globals the script expects. */
function makeContext({ sheet, email, properties }) {
  const calls = { publish: [], files: [], folders: [] };

  const context = {
    console,
    JSON,
    String,
    Object,
    Array,
    Math,
    Error,
    Date,
    RegExp,

    SpreadsheetApp: {
      openById: () => sheet,
    },

    DriveApp: {
      getFolderById: () => ({
        getFoldersByName: () => ({
          hasNext: () => false,
        }),
        createFolder: (name) => {
          calls.folders.push(name);
          return {
            getFilesByName: () => ({ hasNext: () => false }),
            createFile: (blob) => {
              calls.files.push({ name: blob.getName(), bytes: blob.getBytes() });
            },
          };
        },
      }),
    },

    Utilities: {
      base64Decode: (value) => value,
      newBlob: (bytes, type, name) => ({
        getBytes: () => bytes,
        getName: () => name,
      }),
    },

    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (name) => properties[name] ?? null,
      }),
    },

    Session: {
      getActiveUser: () => ({
        getEmail: () => email,
      }),
    },

    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (body) => ({
        setMimeType: () => ({ body }),
      }),
    },

    UrlFetchApp: {
      fetch: (url, options) => {
        calls.publish.push({ url, body: options.payload });
        return { getResponseCode: () => 204, getContentText: () => '' };
      },
    },

    __calls: calls,
  };

  return context;
}

/* ── Run the script ───────────────────────────────────────────────────── */

const source = readFileSync(join(ROOT, 'apps-script', 'Code.gs'), 'utf8');

function load(context) {
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

/* ── The checks ───────────────────────────────────────────────────────── */

let failed = 0;
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

/** The rows of a tab, as objects. */
function rowsOf(sheet, tab) {
  const rows = sheet.tabs[tab].rows;
  const header = rows[0];
  return rows.slice(1).map((row) => {
    const object = {};
    header.forEach((column, index) => {
      object[column] = row[index] ?? '';
    });
    return object;
  });
}

console.log('The Apps Script, against a mocked sheet.\n');

/* ── 1. A new case creates a row in all three tabs ───────────────────── */
{
  console.log('A new case');
  const sheet = buildSheet({});
  const context = load(makeContext({
    sheet,
    email: 'editor@example.com',
    properties: {
      SPREADSHEET_ID: 'sheet',
      DRIVE_FOLDER_ID: 'folder',
      GITHUB_TOKEN: 'token',
      GITHUB_OWNER: 'oneup24',
      GITHUB_REPO: 'migather-www',
    },
  }));

  // The allow-list, in the settings tab.
  sheet.tabs.settings = makeTab([
    ['key', 'value'],
    ['editors', 'editor@example.com'],
  ]);

  const result = context.save_(
    {
      slug: 'acme-hk-2026',
      locale: 'en',
      client: 'Acme HK',
      sector: 'finance',
      summary: 'The first sentence.',
      source: 'Deck p.4',
    },
    false,
  );

  check('the save succeeded', result.slug === 'acme-hk-2026', JSON.stringify(result));
  for (const tab of ['cases_EN', 'cases_ZH-HANT', 'cases_ZH-HANS']) {
    const rows = rowsOf(sheet, tab);
    const row = rows.find((r) => r.slug === 'acme-hk-2026');
    check(`${tab} has a row for it`, !!row);
    if (!row) continue;
    check(`${tab} row carries the slug`, row.slug === 'acme-hk-2026');
    check(`${tab} row carries the client`, row.client === 'Acme HK');
    check(`${tab} row carries the source`, row.source === 'Deck p.4');
    check(`${tab} row is a draft`, row.published === 'false');
  }
  check(
    'the English summary is filled in',
    rowsOf(sheet, 'cases_EN').find((r) => r.slug === 'acme-hk-2026').summary === 'The first sentence.',
  );
  check(
    'the Chinese summaries are still empty',
    rowsOf(sheet, 'cases_ZH-HANT').find((r) => r.slug === 'acme-hk-2026').summary === '',
  );
}

/* ── 2. An edit keeps the other languages, and the shared fields ──────── */
{
  console.log('\nAn existing case, edited');
  const sheet = buildSheet({
    'huatai-finance-hk': {
      slug: 'huatai-finance-hk',
      client: 'Huatai Finance HK',
      clientLocal: '華泰證券',
      sector: 'finance',
      services: 'strategic-creative, kol',
      summary: 'Old English',
      source: 'Deck p.1',
      image: 'case-huatai.jpg',
      mockup: 'true',
      published: 'true',
    },
  });
  sheet.tabs.settings = makeTab([
    ['key', 'value'],
    ['editors', 'editor@example.com'],
  ]);

  // Give the Chinese tabs their own copy, so the test can prove it survives.
  const zh = sheet.tabs['cases_ZH-HANT'].rows[1];
  zh[7] = '舊的繁體中文';
  const zs = sheet.tabs['cases_ZH-HANS'].rows[1];
  zs[7] = '旧的中文';

  const context = load(makeContext({
    sheet,
    email: 'editor@example.com',
    properties: {
      SPREADSHEET_ID: 'sheet',
      DRIVE_FOLDER_ID: 'folder',
      GITHUB_TOKEN: 'token',
      GITHUB_OWNER: 'oneup24',
      GITHUB_REPO: 'migather-www',
    },
  }));

  context.save_(
    {
      slug: 'huatai-finance-hk',
      locale: 'en',
      client: 'Huatai Finance HK',
      summary: 'New English',
      source: 'Deck p.1',
    },
    false,
  );

  const en = rowsOf(sheet, 'cases_EN').find((r) => r.slug === 'huatai-finance-hk');
  const hant = rowsOf(sheet, 'cases_ZH-HANT').find((r) => r.slug === 'huatai-finance-hk');
  const hans = rowsOf(sheet, 'cases_ZH-HANS').find((r) => r.slug === 'huatai-finance-hk');

  check('the English summary changed', en.summary === 'New English', en.summary);
  check('the Traditional Chinese summary survived', hant.summary === '舊的繁體中文', hant.summary);
  check('the Simplified Chinese summary survived', hans.summary === '旧的中文', hans.summary);
  check('the image name is in every tab', [en, hant, hans].every((r) => r.image === 'case-huatai.jpg'));
  check(
    'the categories are in every tab',
    [en, hant, hans].every((r) => r.services === 'strategic-creative, kol'),
  );
}

/* ── 3. Publishing needs all three languages ─────────────────────────── */
{
  console.log('\nPublishing');
  const sheet = buildSheet({
    'draft-case': { slug: 'draft-case', client: 'Draft Co', sector: 'finance' },
  });
  sheet.tabs.settings = makeTab([
    ['key', 'value'],
    ['editors', 'editor@example.com'],
  ]);

  const context = load(makeContext({
    sheet,
    email: 'editor@example.com',
    properties: {
      SPREADSHEET_ID: 'sheet',
      DRIVE_FOLDER_ID: 'folder',
      GITHUB_TOKEN: 'token',
      GITHUB_OWNER: 'oneup24',
      GITHUB_REPO: 'migather-www',
    },
  }));

  const result = context.save_(
    { slug: 'draft-case', locale: 'en', client: 'Draft Co', sector: 'finance', summary: 'Something.' },
    true,
  );

  const row = rowsOf(sheet, 'cases_EN').find((r) => r.slug === 'draft-case');
  check('a case with one language stays a draft', row.published === 'false', row.published);
  check('the form says so', result.published === false);
  // Readiness needs a summary, a client name and alt text in a language, so a
  // case with only a summary is not ready in any of them.
  check(
    'the readiness is reported',
    result.readiness.ready === 0 && result.readiness.total === 3,
    JSON.stringify(result.readiness),
  );
  check('GitHub was not asked to publish', context.__calls.publish.length === 0);
}

/* ── 4. Somebody who is not on the list is refused ────────────────────── */
{
  console.log('\nThe allow-list');
  const sheet = buildSheet({});
  sheet.tabs.settings = makeTab([
    ['key', 'value'],
    ['editors', 'editor@example.com'],
  ]);

  const context = load(makeContext({
    sheet,
    email: 'stranger@example.com',
    properties: {
      SPREADSHEET_ID: 'sheet',
      DRIVE_FOLDER_ID: 'folder',
      GITHUB_TOKEN: 'token',
      GITHUB_OWNER: 'oneup24',
      GITHUB_REPO: 'migather-www',
    },
  }));

  const reply = JSON.parse(
    context.api('save', JSON.stringify({ slug: 'x', locale: 'en' })).body,
  );
  check('a stranger is refused', reply.ok === false && /allow-list/.test(reply.error), JSON.stringify(reply));
  check('nothing was written', sheet.tabs.cases_EN.rows.length === 1);

  const allowed = JSON.parse(
    context.api('load', JSON.stringify({ slug: 'nope', locale: 'en' })).body,
  );
  check('a stranger cannot read a case either', allowed.ok === false);
}

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
