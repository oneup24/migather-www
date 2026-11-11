/**
 * Read a tab out of the works sheet, using the service account.
 *
 * Usage: node tools/cms/read-sheet.mjs <spreadsheet-id> <tab> [--credentials <file>]
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { loadCredentials, getAccessToken, readRanges } from './lib/google.mjs';

const [, , spreadsheetId, tab] = process.argv;
if (!spreadsheetId || !tab) {
  console.error('usage: node tools/cms/read-sheet.mjs <spreadsheet-id> <tab>');
  process.exit(1);
}

const credArg = process.argv.indexOf('--credentials');
const credPath =
  credArg > -1
    ? process.argv[credArg + 1]
    : join(homedir(), 'Downloads', 'migather-cms-102c87ca9323.json');

const key = loadCredentials(readFileSync(credPath, 'utf8'));
const token = await getAccessToken(key);
const ranges = await readRanges(spreadsheetId, token, [tab]);

for (const row of ranges[tab] ?? []) {
  console.log(JSON.stringify(row));
}
