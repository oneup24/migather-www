/**
 * The editor allow-list.
 *
 * The list lives in the `settings` tab of the sheet, on the `editors` row —
 * comma-separated email addresses. This tool reads and writes that row, so
 * the list can be managed from the command line rather than by hand-editing a
 * cell in a browser.
 *
 * The list is read on every request by the Apps Script, so a change here
 * takes effect immediately. Nothing needs redeploying.
 *
 * Usage:
 *   node tools/cms/editors.mjs --list
 *   node tools/cms/editors.mjs --add someone@example.com
 *   node tools/cms/editors.mjs --remove someone@example.com
 *   node tools/cms/editors.mjs --set a@example.com,b@example.com
 *
 * Options:
 *   --spreadsheet <id>    the sheet id           ($CMS_SPREADSHEET_ID)
 *   --credentials <path>  the service-account key file or the key itself
 *                         ($GCP_SERVICE_ACCOUNT_JSON)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { getAccessToken, readRanges, writeRange, WRITE_SCOPES } from './lib/google.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const argv = process.argv.slice(2);
const argOf = (flag) => {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
};

const OPTIONS = {
  spreadsheet: argOf('--spreadsheet') ?? process.env.CMS_SPREADSHEET_ID,
  credentials: argOf('--credentials') ?? process.env.GCP_SERVICE_ACCOUNT_JSON,
};

const SETTINGS_TAB = 'settings';

if (!OPTIONS.spreadsheet) {
  console.error('no spreadsheet — pass --spreadsheet <id> or set CMS_SPREADSHEET_ID');
  process.exit(1);
}

const key = JSON.parse(
  OPTIONS.credentials.trim().startsWith('{')
    ? OPTIONS.credentials
    : readFileSync(OPTIONS.credentials, 'utf8'),
);
const token = await getAccessToken(key, WRITE_SCOPES);

/** The settings tab, as rows. */
async function readSettings() {
  const values = await readRanges(OPTIONS.spreadsheet, token, [SETTINGS_TAB]);
  const rows = values[SETTINGS_TAB] ?? [];
  if (rows.length === 0) {
    throw new Error(`the sheet has no ${SETTINGS_TAB} tab — run the seed first`);
  }
  return rows;
}

/** The current allow-list. */
function parseEditors(rows) {
  const header = rows[0];
  const keyIndex = header.indexOf('key');
  const valueIndex = header.indexOf('value');
  const row = rows.slice(1).find((r) => r[keyIndex] === 'editors');
  return {
    list: String(row?.[valueIndex] ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    keyIndex,
    valueIndex,
  };
}

/** Write the allow-list back. */
async function writeEditors(rows, { list, keyIndex, valueIndex }) {
  const existing = rows.slice(1).find((r) => r[keyIndex] === 'editors');
  if (existing) existing[valueIndex] = list.join(', ');
  else rows.push(['editors', list.join(', ')]);

  await writeRange(OPTIONS.spreadsheet, token, SETTINGS_TAB, rows);
}

const rows = await readSettings();
const { list, keyIndex, valueIndex } = parseEditors(rows);

const add = argOf('--add');
const remove = argOf('--remove');
const set = argOf('--set');

if (add) {
  const email = add.trim().toLowerCase();
  if (!list.includes(email)) list.push(email);
  await writeEditors(rows, { list, keyIndex, valueIndex });
  console.log(`added ${email}`);
} else if (remove) {
  const email = remove.trim().toLowerCase();
  const next = list.filter((e) => e !== email);
  if (next.length === list.length) {
    console.log(`${email} was not on the list`);
  } else {
    await writeEditors(rows, { list: next, keyIndex, valueIndex });
    console.log(`removed ${email}`);
  }
} else if (set) {
  const next = set
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  await writeEditors(rows, { list: next, keyIndex, valueIndex });
  console.log('the list is now');
  for (const email of next) console.log(`  ${email}`);
} else {
  console.log('The editor allow-list:');
  if (list.length === 0) console.log('  (empty — nobody may edit)');
  for (const email of list) console.log(`  ${email}`);
}
