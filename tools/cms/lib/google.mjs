/**
 * Google Sheets, Google Drive and GitHub — the three APIs the CMS uses.
 *
 * The service account signs its own JWT with `node:crypto` and exchanges it
 * for an access token. No npm dependency is added: the repository has none,
 * and the plan keeps it that way.
 *
 * The key never leaves the machine that holds it. In CI it comes from a
 * repository secret; on a laptop it comes from a file the operator points at
 * with `--credentials`.
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** The scopes the service account needs to pull content. */
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

/**
 * The scopes the service account needs to seed the sheet and the Drive
 * folder. The seed writes; the sync only reads, so the sync's workflow
 * secret can be scoped down to the read-only pair.
 */
export const WRITE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

/** base64url without the padding. */
function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Read a service-account key.
 *
 * Accepts a path to the JSON key file, or the key itself as a string, so the
 * same code path works in CI (a secret) and on a laptop (a file).
 *
 * The string form is what GitHub Actions holds. A secret is one line, and a
 * service-account key is not: pasted raw, the private key's line breaks are
 * lost and the value is truncated. The error says so, because "unexpected
 * end of JSON input" does not.
 */
export function loadCredentials(source) {
  if (!source) throw new Error('no service-account key was given');

  const raw = source.trim().startsWith('{') ? source : readFileSync(source, 'utf8');

  let key;
  try {
    key = JSON.parse(raw);
  } catch (error) {
    const looksTruncated = raw.trim().startsWith('{') && !raw.trim().endsWith('}');
    if (looksTruncated) {
      throw new Error(
        'the service-account key is truncated — it was pasted as a multi-line file and only the first line was stored. Minify it onto one line:\n' +
          "  python3 -c \"import json;print(json.dumps(json.load(open('migather-cms.json'))))\"",
      );
    }
    throw new Error(`the service-account key is not valid JSON — ${error.message}`);
  }

  if (!key.client_email || !key.private_key) {
    throw new Error(
      'the service-account key needs a client_email and a private_key — the wrong file was used',
    );
  }
  return key;
}

/**
 * Sign a service-account JWT.
 *
 * RS256 over `{ iss, scope, aud, iat, exp }`, which is the assertion the
 * OAuth token endpoint accepts in place of a password.
 */
export function signJwt(key, { scope = SCOPES, audience = TOKEN_URL, now = Date.now() } = {}) {
  const issuedAt = Math.floor(now / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: Array.isArray(scope) ? scope.join(' ') : scope,
      aud: audience,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  );

  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer
    .sign(key.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${header}.${claims}.${signature}`;
}

/** Exchange the signed assertion for an access token. */
export async function getAccessToken(key, scope = SCOPES) {
  const assertion = signJwt(key, { scope });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `the token request failed (${response.status}): ${body.error_description ?? body.error ?? response.statusText}`,
    );
  }
  return body.access_token;
}

/** The names of the tabs in a spreadsheet. */
export async function sheetTabs(spreadsheetId, token) {
  const tabs = await spreadsheetTabs(spreadsheetId, token);
  return tabs.map((tab) => tab.title);
}

/** The tabs in a spreadsheet, with their sheet ids. */
export async function spreadsheetTabs(spreadsheetId, token) {
  const response = await fetch(`${SHEETS_URL}/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not read the spreadsheet (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return (body.sheets ?? [])
    .map((sheet) => sheet.properties)
    .filter((properties) => properties?.title);
}

/** Delete a tab. */
export async function deleteTab(spreadsheetId, token, sheetId) {
  const response = await fetch(`${SHEETS_URL}/${spreadsheetId}/sheets/${sheetId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `could not delete the tab (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return true;
}

/**
 * Read several ranges in one call.
 *
 * `ranges` are tab names — the whole tab is read, header row included.
 * A tab that does not exist comes back as an empty range rather than as an
 * error, which is how the compiler learns that a tab is missing.
 */
export async function readRanges(spreadsheetId, token, ranges) {
  const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
  const response = await fetch(`${SHEETS_URL}/${spreadsheetId}/values:batchGet?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not read the sheet (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }

  const values = {};
  (body.valueRanges ?? []).forEach((range, index) => {
    const name = ranges[index];
    if (name !== undefined) values[name] = range.values ?? [];
  });
  for (const range of ranges) if (values[range] === undefined) values[range] = [];
  return values;
}

/** Write a block of rows into a range, overwriting what is there. */
export async function writeRange(spreadsheetId, token, range, values) {
  const response = await fetch(
    `${SHEETS_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not write ${range} (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}

/** Append rows to the end of a tab. */
export async function appendRange(spreadsheetId, token, range, values) {
  const query = `valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const response = await fetch(
    `${SHEETS_URL}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?${query}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not append to ${range} (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}

/** Add a tab to the spreadsheet. */
export async function addTab(spreadsheetId, token, title) {
  const response = await fetch(`${SHEETS_URL}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not add the tab ${title} (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}

/** The files in a Drive folder, by name. */
export async function listFolder(token, folderId) {
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `${DRIVE_URL}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(
    'files(id,name,mimeType,size)',
  )}&pageSize=1000`;

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not list the Drive folder (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body.files ?? [];
}

/** Download a file's bytes. */
export async function downloadFile(token, fileId) {
  const response = await fetch(`${DRIVE_URL}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`could not download the file ${fileId} (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/** Create a folder inside a parent folder. */
export async function createFolder(token, parentId, name) {
  const response = await fetch(`${DRIVE_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not create the folder ${name} (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}

/**
 * Upload a file into a folder.
 *
 * The multipart body is built by hand: `fetch` cannot set the boundary the
 * way the `FormData` helper does for a binary part, and the repository has
 * no npm dependencies to lean on.
 */
export async function uploadFile(token, parentId, name, bytes, mimeType) {
  const boundary = `migather-${Date.now().toString(16)}`;
  const metadata = JSON.stringify({ name, parents: [parentId] });

  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    'utf8',
  );
  const tail = Buffer.from(`\r\n--${boundary}--`, 'utf8');

  const response = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: Buffer.concat([head, Buffer.from(bytes), tail]),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `could not upload ${name} (${response.status}): ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}

/**
 * Ask GitHub to run the sync workflow.
 *
 * `repository_dispatch` is the trigger the Apps Script fires when an editor
 * presses "Save & publish". The token lives in the script's properties, never
 * in the browser and never in the repository.
 */
export async function repositoryDispatch({ token, owner, repo, eventType = 'sync-cases' }) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'migather-cms',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_type: eventType }),
  });

  if (!response.ok && response.status !== 204) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `could not trigger the publish (${response.status}): ${body.message ?? response.statusText}`,
    );
  }
  return true;
}
