/**
 * Stamp `publishRequested` in the sheet's settings tab.
 *
 * The Apps Script only honours a publish request that was asked for from the
 * sheet within the last two minutes — that is the gate that keeps a stranger
 * who found the script's address from rebuilding the site.
 *
 * Usage: node tools/cms/request-publish.mjs [--credentials <file>]
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import {
  loadCredentials,
  getAccessToken,
  readRanges,
  writeRange,
  WRITE_SCOPES,
} from './lib/google.mjs';

const SPREADSHEET_ID = '141I1EcV1sG3bCemBNcA_7nJlcQXwLPrvP_SzHMvomgg';

const credArg = process.argv.indexOf('--credentials');
const credPath =
  credArg > -1
    ? process.argv[credArg + 1]
    : join(homedir(), 'Downloads', 'migather-cms-102c87ca9323.json');

const key = loadCredentials(readFileSync(credPath, 'utf8'));
const token = await getAccessToken(key, WRITE_SCOPES);

const rows = (await readRanges(SPREADSHEET_ID, token, ['settings']))['settings'] ?? [];
const index = rows.findIndex((row) => String(row[0]) === 'publishRequested');

if (index === -1) {
  console.error('the settings tab has no publishRequested row');
  process.exit(1);
}

const stamp = new Date().toISOString();
await writeRange(SPREADSHEET_ID, token, `settings!B${index + 1}`, [[stamp]]);
console.log(`publishRequested = ${stamp} (row ${index + 1})`);
