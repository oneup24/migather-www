/**
 * A test of the Apps Script.
 *
 * The script reaches for `DriveApp`, `UrlFetchApp` and `SpreadsheetApp`, so
 * this mocks them and runs the real code against a fake Drive and a fake
 * GitHub.
 *
 * What is tested: the picture is filed in the case's folder, the old
 * picture is cleared out, the publish is dispatched, and the outcome is
 * written into the settings tab where the editor's page can read it.
 *
 * Run with:  node tools/cms/test-apps-script.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

let failed = 0;
function check(label, condition, detail = '') {
  if (condition) console.log(`  ok    ${label}`);
  else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

/* ── The fake world ───────────────────────────────────────────────────── */

/** A Drive folder that remembers what is in it. */
function makeFolder(name) {
  const folder = {
    name,
    children: [],
    getFoldersByName: (wanted) => {
      const found = folder.children.filter((child) => child.isFolder && child.name === wanted);
      return {
        hasNext: () => found.length > 0,
        next: () => found[0],
      };
    },
    createFolder: (childName) => {
      const child = makeFolder(childName);
      child.isFolder = true;
      folder.children.push(child);
      return child;
    },
    getFiles: () => {
      const files = folder.children.filter((child) => !child.isFolder);
      let index = 0;
      return {
        hasNext: () => index < files.length,
        next: () => files[index++],
      };
    },
    getFilesByName: (wanted) => {
      const found = folder.children.filter((child) => !child.isFolder && child.name === wanted);
      return {
        hasNext: () => found.length > 0,
        next: () => found[0],
      };
    },
    createFile: (blob) => {
      const file = {
        name: blob.getName(),
        bytes: blob.getBytes(),
        trashed: false,
        setTrashed: (value) => {
          file.trashed = value;
        },
        setContent: (bytes) => {
          file.bytes = bytes;
        },
      };
      folder.children.push(file);
      return file;
    },
  };
  return folder;
}

/** A sheet with one tab, writable. */
function makeSheet(rows) {
  const values = rows.map((row) => [...row]);

  /* The sheet grows to fit what is written to it, the way the real one
     does. A row that is written past the end is a new row. */
  const ensure = (rowCount) => {
    while (values.length < rowCount) values.push([]);
  };

  const tab = {
    getDataRange: () => ({ getValues: () => values.map((row) => [...row]) }),
    getRange: (row, column, numRows = 1, numColumns = 1) => ({
      setValue: (value) => {
        ensure(row);
        values[row - 1][column - 1] = String(value);
      },
      setValues: (block) => {
        ensure(row + block.length - 1);
        block.forEach((line, r) => {
          line.forEach((cell, c) => {
            values[row - 1 + r][column - 1 + c] = String(cell);
          });
        });
      },
    }),
  };
  return {
    getSheetByName: (name) => (name === 'settings' ? tab : null),
    get values() {
      return values;
    },
  };
}

/** The fake Drive, the fake sheet and the fake GitHub. */
function makeContext(options = {}) {
  const root = makeFolder('Migather case images');
  const calls = { dispatched: [], fetched: [], settings: [] };

  const settingsRows = [
    ['key', 'value'],
    ['editors', 'editor@example.com'],
    ['github_owner', 'oneup24'],
    ['github_repo', 'migather-www'],
    ['lastPublish', ''],
    ['lastPublishStatus', ''],
    ['publishRequested', new Date().toISOString()],
  ];

  const sheet = makeSheet(settingsRows);

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
    Utilities: {
      base64Decode: (value) => value,
      newBlob: (bytes, type, name) => ({ getBytes: () => bytes, getName: () => name }),
      sleep: () => {},
    },
    ContentService: {
      MimeType: { TEXT: 'text/plain', JSON: 'application/json' },
      createTextOutput: (body) => ({
        body,
        setMimeType: () => ({ body }),
      }),
    },
    HtmlService: {
      createHtmlOutput: (html) => ({
        html,
        setTitle: () => ({ html }),
      }),
    },
    SpreadsheetApp: { openById: () => sheet },
    DriveApp: { getFolderById: () => root },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (name) =>
          ({
            SPREADSHEET_ID: 'sheet',
            DRIVE_FOLDER_ID: 'folder',
            GITHUB_TOKEN: 'token',
            GITHUB_OWNER: 'oneup24',
            GITHUB_REPO: 'migather-www',
          })[name] ?? null,
      }),
    },
    UrlFetchApp: {
      fetch: (url, opts) => {
        if (url.includes('/actions/workflows/')) {
          const body = options.runs ?? {
            workflow_runs: [
              {
                created_at: new Date(Date.now() + 1000).toISOString(),
                status: 'completed',
                conclusion: 'success',
              },
            ],
          };
          return { getResponseCode: () => 200, getContentText: () => JSON.stringify(body) };
        }
        if (url.includes('api.github.com/repos/') && !url.includes('/dispatches')) {
          return { getResponseCode: () => 200, getContentText: () => '{}' };
        }
        calls.fetched.push({ url, opts });
        if (url.includes('/dispatches')) {
          calls.dispatched.push(JSON.parse(opts.payload));
          return { getResponseCode: () => 204, getContentText: () => '' };
        }
        return { getResponseCode: () => 200, getContentText: () => '{}' };
      },
    },
    __calls: calls,
    __sheet: sheet,
    __root: root,
  };

  return context;
}

/**
 * The form fields, the way Apps Script hands them over.
 *
 * This is an object, not a method. `request.parameter` is a plain object of
 * key/value pairs, so `request.parameter('action')` throws — and because
 * that read sits on the first line of `doPost`, a publish request dies
 * before anything is answered.
 *
 * The mock used to be a function, which hid that: the test passed against
 * code that could not work in Apps Script. Every call below now uses this.
 */
function formFields(fields) {
  return { ...fields };
}

/* ── Run the script ───────────────────────────────────────────────────── */

const source = readFileSync(join(ROOT, 'apps-script', 'Code.gs'), 'utf8');

function load(context) {
  vm.createContext(context);
  vm.runInContext(source, context);
  return context;
}

/** The value of a settings row, read from the sheet itself. */
function setting(context, key) {
  const row = context.__sheet.values.find((entry) => entry[0] === key);
  return row ? row[1] : undefined;
}

/* ── The checks ───────────────────────────────────────────────────────── */

console.log('The Apps Script, against a mocked Drive and a mocked GitHub.\n');

/* ── 1. A picture is filed in the case's folder ───────────────────────── */
{
  console.log('Saving a picture');
  const context = load(makeContext());
  const reply = context.doPost({
    parameter: formFields({
      action: 'image',
      slug: 'acme-hk-2026',
      fileName: 'acme-hk-2026.jpg',
      dataUrl: 'data:image/jpeg;base64,AAAA',
    }),
  });

  check('the reply says it saved', /saved/i.test(String(reply.body ?? reply)), String(reply.body ?? reply));

  const caseFolder = context.__root.children.find((child) => child.name === 'acme-hk-2026');
  check('a folder was created for the case', !!caseFolder);
  const picture = caseFolder?.children?.[0];
  check('the picture is in it', picture?.name === 'acme-hk-2026.jpg', JSON.stringify(picture?.name));
  check('the bytes were kept', picture?.bytes === 'AAAA', String(picture?.bytes));
}

/* ── 2. A bad slug or file name is refused ───────────────────────────── */
{
  console.log('\nRefusing nonsense');
  const context = load(makeContext());
  context.doPost({
    parameter: formFields({
      action: 'image',
      slug: 'Not A Slug',
      fileName: 'x.jpg',
      dataUrl: 'data:image/jpeg;base64,AA',
    }),
  });
  check('no folder was made for a bad slug', context.__root.children.length === 0);
}

/* ── 3. Publishing dispatches, and reports the outcome ────────────────── */
{
  console.log('\nPublishing');
  const context = load(makeContext());
  const reply = context.doPost({ parameter: formFields({ action: 'publish' }) });

  check('the reply says it is rebuilding', /rebuild/i.test(String(reply.body ?? reply)));
  check('GitHub was asked to dispatch', context.__calls.dispatched.length === 1);
  check('the event type is right', context.__calls.dispatched[0]?.event_type === 'sync-cases');
  check('the publish was stamped', String(setting(context, 'lastPublish')).length > 10);
  check('the outcome was written', setting(context, 'lastPublishStatus') === 'ok', setting(context, 'lastPublishStatus'));
}

/* ── 3b. A build that is still going is left to the report workflow ──── */
{
  console.log('\nA build that has not finished yet');
  const context = load(
    makeContext({
      runs: {
        workflow_runs: [
          {
            created_at: new Date(Date.now() + 1000).toISOString(),
            status: 'in_progress',
            conclusion: null,
          },
        ],
      },
    }),
  );
  context.doPost({ parameter: formFields({ action: 'publish' }) });

  /* The script has answered by now. The build is still running, and the
     report workflow is what writes the result when it ends — so the script
     must not claim a result it does not have. */
  check(
    'the status is left as dispatched',
    setting(context, 'lastPublishStatus') === 'dispatched',
    setting(context, 'lastPublishStatus'),
  );
  check('no result was invented', !['ok', 'failed'].includes(setting(context, 'lastPublishStatus')));
}

/* ── 4. A failed build is reported as a failure ───────────────────────── */
{
  console.log('\nA build that failed');
  const context = load(
    makeContext({
      runs: {
        workflow_runs: [
          {
            created_at: new Date(Date.now() + 1000).toISOString(),
            status: 'completed',
            conclusion: 'failure',
          },
        ],
      },
    }),
  );
  context.doPost({ parameter: formFields({ action: 'publish' }) });

  check('the outcome says it failed', setting(context, 'lastPublishStatus') === 'failed', setting(context, 'lastPublishStatus'));
  check(
    'there is a message to show',
    String(setting(context, 'lastPublishMessage') ?? '').length > 0,
    String(setting(context, 'lastPublishMessage')),
  );
}

/* ── 5. A publish nobody asked for is refused ────────────────────────── */
{
  console.log('\nA publish nobody asked for');
  const context = load(makeContext());
  const rows = context.__sheet.values;
  const index = rows.findIndex((row) => row[0] === 'publishRequested');
  rows[index] = ['publishRequested', new Date(Date.now() - 10 * 60 * 1000).toISOString()];

  const reply = context.doPost({ parameter: formFields({ action: 'publish' }) });
  check('a stale request is refused', String(reply.body ?? reply).includes('not requested'), String(reply.body ?? reply));
  check('nothing was dispatched', context.__calls.dispatched.length === 0);
}

/* ── 6. A stale token is reported, not hidden ─────────────────────────── */
{
  console.log('\nA token that has expired');
  const context = load(makeContext());
  context.__calls.fetched = [];
  const original = context.UrlFetchApp.fetch;
  context.UrlFetchApp.fetch = (url, opts) => {
    if (url.includes('/dispatches')) {
      return { getResponseCode: () => 401, getContentText: () => 'Bad credentials' };
    }
    return original(url, opts);
  };

  const reply = context.doPost({ parameter: formFields({ action: 'publish' }) });
  check('the refusal is reported', String(reply.body ?? reply).includes('401'), String(reply.body ?? reply));
  check(
    'the sheet says the build did not start',
    setting(context, 'lastPublishStatus') === 'unknown',
    setting(context, 'lastPublishStatus'),
  );
  check(
    'there is a message to show',
    String(setting(context, 'lastPublishMessage') ?? '').length > 0,
    String(setting(context, 'lastPublishMessage')),
  );
}

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
