/**
 * The browser's side of Google — sign-in, and the two APIs the editor uses.
 *
 * The editor signs in with their own Google account, so the sheet is written
 * as *them*. There is no service account in the browser, no client secret,
 * and no token that outlives the tab.
 *
 * The scopes are deliberately few:
 *
 *   spreadsheets          read and write the sheet — the copy
 *   drive.file            see and create only the files this page creates
 *
 * `drive.file` rather than `drive`: an editor should not have to hand this
 * page their whole Drive to move one picture.
 */

/**
 * The scopes the editor grants.
 *
 * The sheet's own sharing is the real gate — only the agency account and
 * the service account can open it — so these scopes only decide what an
 * editor who already has access is allowed to do.
 *
 * No Drive scope, and no client secret: the picture is handed to the Apps
 * Script, which runs as the editor and has storage quota. The browser only
 * ever handles the copy.
 */
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
];

/** Where Google's token endpoint lives. */
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets';

/* ── Signing in ───────────────────────────────────────────────────────── */

/**
 * The Google Identity Services script, loaded once.
 *
 * It is Google's own widget: a button, a popup, and a token. There is no
 * client secret in the browser and nothing to store.
 */
let gisPromise = null;

export function loadGoogleIdentity() {
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google ? resolve(window.google) : reject(new Error('Google did not load'));
    script.onerror = () => reject(new Error('the Google sign-in script could not be loaded'));
    document.head.appendChild(script);
  });

  return gisPromise;
}

/**
 * Ask the editor to sign in.
 *
 * Resolves with `{ email, accessToken }`. The token is kept in memory only —
 * closing the tab forgets it.
 *
 * This is the OAuth 2.0 token model, not the sign-in button: the sign-in
 * button returns an identity, and what the sheet needs is a token that can
 * write.
 */
export function signIn(clientId) {
  return loadGoogleIdentity().then(
    (google) =>
      new Promise((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES.join(' '),
          callback: async (response) => {
            if (!response.access_token) {
              reject(new Error('Google did not return a token'));
              return;
            }
            try {
              const who = await whoAmI(response.access_token);
              resolve({ email: who.email, accessToken: response.access_token });
            } catch (error) {
              reject(error);
            }
          },
          error_callback: (error) => {
            reject(new Error(error?.message ?? 'the sign-in was cancelled'));
          },
        });

        client.requestAccessToken();
      }),
  );
}

/** The signed-in account's email address, from the token. */
export async function whoAmI(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('the signed-in account could not be read');
  const body = await response.json();
  return { email: body.email ?? '', name: body.name ?? '' };
}

/* ── The sheet ─────────────────────────────────────────────────────────── */

/**
 * Read several tabs of a spreadsheet.
 *
 * The same call the sync uses, from the browser this time.
 */
export async function readTabs(spreadsheetId, accessToken, tabs) {
  const query = tabs.map((tab) => `ranges=${encodeURIComponent(tab)}`).join('&');
  const response = await fetch(`${SHEETS}/${spreadsheetId}/values:batchGet?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `the sheet could not be read (${response.status}) — ${body.error?.message ?? 'check that this account has access'}`,
    );
  }

  const values = {};
  (body.valueRanges ?? []).forEach((range, index) => {
    if (tabs[index] !== undefined) values[tabs[index]] = range.values ?? [];
  });
  for (const tab of tabs) if (values[tab] === undefined) values[tab] = [];
  return values;
}

/**
 * Write rows into a tab.
 *
 * `RAW` means the text is stored as typed — no formula, no number coercion.
 */
export async function writeTab(spreadsheetId, accessToken, tab, rows) {
  const range = encodeURIComponent(tab);
  const response = await fetch(
    `${SHEETS}/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ range: tab, majorDimension: 'ROWS', values: rows }),
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `the sheet could not be written (${response.status}) — ${body.error?.message ?? response.statusText}`,
    );
  }
  return true;
}

/**
 * Make sure the tabs exist, with their header rows.
 *
 * A sheet that has never had a frame in it has no gallery tab, and the
 * Sheets API refuses a read that names a range which is not there — so the
 * whole editor would go down over a picture nobody has uploaded yet. The
 * tabs are created first, and every read that follows finds them.
 */
export async function ensureTabs(spreadsheetId, accessToken, tabs) {
  const response = await fetch(`${SHEETS}/${spreadsheetId}?fields=sheets.properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return false;

  const existing = new Set((body.sheets ?? []).map((sheet) => sheet.properties?.title));
  const missing = tabs.filter((tab) => !existing.has(tab.title));
  if (missing.length === 0) return true;

  const created = await fetch(`${SHEETS}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: missing.map((tab) => ({ addSheet: { properties: { title: tab.title } } })),
    }),
  });
  if (!created.ok) return false;

  for (const tab of missing) {
    await writeTab(spreadsheetId, accessToken, tab.title, [tab.header]);
  }
  return true;
}

/**
 * Write one row of a tab, matched on its slug.
 *
 * The sheet is the source of truth and two people may be in it at once, so
 * the row is read again immediately before it is written. The row index is
 * found by its slug, never remembered.
 */
export async function writeRowBySlug(spreadsheetId, accessToken, tab, columns, row) {
  const values = await readTabs(spreadsheetId, accessToken, [tab]);
  const current = values[tab] ?? [];

  const slugIndex = columns.indexOf('slug');
  let target = -1;
  for (let i = 1; i < current.length; i += 1) {
    if (current[i][slugIndex] === row.slug) {
      target = i;
      break;
    }
  }

  const line = columns.map((column) => row[column] ?? '');

  if (target === -1) {
    /* The case is not in this tab yet, so its row goes at the end.
       Writing the header and the row from the top of the tab would
       overwrite the first case in it — the write starts at A1, and the
       row lands on row 2. That is how a case went missing from the sheet
       once already: a case was added, and the first case in the tab was
       silently replaced by it. */
    const header = current[0] ?? columns;
    const width = Math.max(header.length, columns.length);
    const padded = line.slice();
    while (padded.length < width) padded.push('');

    const range = `${tab}!A${current.length + 1}`;
    await writeTab(spreadsheetId, accessToken, range, [padded]);
    return { written: 'appended' };
  }

  const range = `${tab}!A${target + 1}`;
  const response = await fetch(
    `${SHEETS}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [line.map((cell) => cell ?? '')],
      }),
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `the row could not be written (${response.status}) — ${body.error?.message ?? response.statusText}`,
    );
  }
  return { written: 'updated' };
}

/* ── The Apps Script ──────────────────────────────────────────────────── */

/**
 * Hand something to the Apps Script.
 *
 * The browser cannot read a reply from the Apps Script — it sends no CORS
 * headers — so this is a one-way street. It is used for the two things the
 * browser cannot do itself: saving a picture, and asking for a publish.
 *
 * The request goes through a hidden iframe, which makes it a first-party
 * request for script.google.com and therefore carries the editor's Google
 * session.
 */
export function postToScript(scriptUrl, payload) {
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.name = `migather-${Date.now().toString(16)}`;
    frame.style.display = 'none';
    frame.setAttribute('aria-hidden', 'true');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = scriptUrl;
    form.target = frame.name;
    form.style.display = 'none';

    for (const [key, value] of Object.entries(payload)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value ?? '');
      form.appendChild(input);
    }

    document.body.appendChild(frame);
    document.body.appendChild(form);

    /* The Apps Script replies into the frame. We cannot read it, but we can
       know it arrived, and that the frame is no longer busy. */
    const done = () => {
      form.remove();
      frame.remove();
      resolve(true);
    };

    frame.addEventListener('load', () => setTimeout(done, 400), { once: true });
    /* A frame that never loads would hang the button forever. */
    setTimeout(done, 30000);

    form.submit();
  });
}

/** Create a folder under a parent. */
export async function createFolder(accessToken, parentId, name) {
  const response = await fetch(`${DRIVE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
      `the folder could not be created (${response.status}) — ${body.error?.message ?? response.statusText}`,
    );
  }
  return body;
}
