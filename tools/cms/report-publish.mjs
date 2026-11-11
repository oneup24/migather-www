/**
 * Write the outcome of a publish into the sheet's settings tab.
 *
 * The editor's page cannot read the Apps Script's reply — Google sends no
 * CORS headers, so the answer lands in a frame the page cannot open. The
 * outcome is reported through the sheet instead: `lastPublish` is stamped
 * when the request goes out, and `lastPublishStatus` when the build has
 * finished.
 *
 * The Apps Script stamps the first of those and cannot write the second on
 * its own: the build happens after the script has answered. This is the
 * part that knows how the build ended, so this is what writes `ok` or
 * `failed` — the two words the editor's page looks for.
 *
 * Usage:
 *   node tools/cms/report-publish.mjs --status ok|failed [--message "..."]
 *
 * Options:
 *   --status <ok|failed>   how the build ended        ($PUBLISH_STATUS)
 *   --message <text>       a line for the record       ($PUBLISH_MESSAGE)
 *   --run-at <time>        when the build was started  ($PUBLISH_RUN_AT)
 *   --spreadsheet <id>     the sheet id                ($CMS_SPREADSHEET_ID)
 *   --credentials <path>   the service-account key     ($GCP_SERVICE_ACCOUNT_JSON)
 */
import { homedir } from 'node:os';
import { join } from 'node:path';

import {
  appendRange,
  getAccessToken,
  loadCredentials,
  readRanges,
  writeRange,
  WRITE_SCOPES,
} from './lib/google.mjs';

function argOf(name) {
  const at = process.argv.indexOf(name);
  return at > -1 ? process.argv[at + 1] : undefined;
}

const OPTIONS = {
  status: argOf('--status') ?? process.env.PUBLISH_STATUS,
  message: argOf('--message') ?? process.env.PUBLISH_MESSAGE ?? '',
  runAt: argOf('--run-at') ?? process.env.PUBLISH_RUN_AT ?? '',
  spreadsheet:
    argOf('--spreadsheet') ??
    process.env.CMS_SPREADSHEET_ID ??
    '141I1EcV1sG3bCemBNcA_7nJlcQXwLPrvP_SzHMvomgg',
  credentials:
    argOf('--credentials') ??
    process.env.GCP_SERVICE_ACCOUNT_JSON ??
    join(homedir(), 'Downloads', 'migather-cms-102c87ca9323.json'),
};

if (!OPTIONS.status || !['ok', 'failed'].includes(OPTIONS.status)) {
  console.error("the status must be 'ok' or 'failed' — pass --status <ok|failed>");
  process.exit(1);
}

/* The key may be the secret itself or the path to a file — the workflow
   passes the secret, a person running this by hand passes a path. */
const key = loadCredentials(OPTIONS.credentials);
const token = await getAccessToken(key, WRITE_SCOPES);

const rows = (await readRanges(OPTIONS.spreadsheet, token, ['settings']))['settings'] ?? [];

/* Two editors can publish at once. The sheet's `lastPublish` is stamped
   before the build is asked for, so a stamp later than this build's start
   belongs to a publish that has taken over — and this build's answer is no
   longer the one the editor is waiting for. */
if (OPTIONS.runAt) {
  const stamped = rows.find((row) => String(row[0]) === 'lastPublish')?.[1];
  if (stamped && Date.parse(stamped) > Date.parse(OPTIONS.runAt)) {
    console.log(
      `a newer publish has been asked for (${stamped} — this build started ${OPTIONS.runAt}); nothing written`,
    );
    process.exit(0);
  }
}

const writes = [
  ['lastPublishStatus', OPTIONS.status],
  /* Which publish the status belongs to. Two publishes in a row both end
     in `ok`, so the status alone cannot say which one it is. */
  ['lastPublishStatusAt', new Date().toISOString()],
  ...(OPTIONS.message ? [['lastPublishMessage', OPTIONS.message]] : []),
];

for (const [key, value] of writes) {
  const index = rows.findIndex((row) => String(row[0]) === key);
  if (index === -1) {
    await appendRange(OPTIONS.spreadsheet, token, 'settings', [[key, value]]);
    console.log(`${key} = ${value} (appended)`);
  } else {
    await writeRange(OPTIONS.spreadsheet, token, `settings!B${index + 1}`, [[value]]);
    console.log(`${key} = ${value} (row ${index + 1})`);
  }
}
