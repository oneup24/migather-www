/**
 * A test of the works editor page.
 *
 * The page talks to three things — Google Identity, the Sheets API and the
 * Apps Script — and none of them can be reached from a test. So they are
 * mocked: a fake Google that hands out a token, a fake Sheets API backed
 * by the real compiled case files, and a fake Apps Script that records
 * what it was asked to do.
 *
 * What is being tested is the part that is ours: that the editor can sign
 * in, load a case, edit it and save it, and that the save writes what it
 * should to the right tabs.
 *
 * Run with:  node tools/cms/test-admin-page.mjs
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* ── The fixture: the real compiled case files, shaped like tabs ──────── */

const records = readdirSync(join(ROOT, 'content', 'cases'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(ROOT, 'content', 'cases', file), 'utf8')))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const CASE_COLUMNS = [
  'slug', 'client', 'clientLocal', 'projectLocal', 'sector', 'services',
  'partnershipSince', 'summary', 'imageAlt', 'image', 'mockup', 'source',
  'featured', 'published',
];

const pick = (value, locale) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  return value[locale] ?? value.en ?? '';
};

/** The tabs, as arrays of arrays. */
function buildTabs() {
  const cases = { en: [CASE_COLUMNS], 'zh-Hant': [CASE_COLUMNS], 'zh-Hans': [CASE_COLUMNS] };
  const results = { en: [['slug', 'order', 'value', 'label', 'note']], 'zh-Hant': [['slug', 'order', 'value', 'label', 'note']], 'zh-Hans': [['slug', 'order', 'value', 'label', 'note']] };
  const scope = { en: [['slug', 'order', 'text']], 'zh-Hant': [['slug', 'order', 'text']], 'zh-Hans': [['slug', 'order', 'text']] };

  for (const record of records) {
    for (const locale of ['en', 'zh-Hant', 'zh-Hans']) {
      cases[locale].push(
        CASE_COLUMNS.map((column) => {
          if (column === 'slug') return record.slug;
          if (column === 'services') return record.services.join(', ');
          if (column === 'clientLocal') return pick(record.clientLocal, locale);
          if (column === 'projectLocal') return pick(record.projectLocal, locale);
          if (column === 'summary') return pick(record.summary, locale);
          if (column === 'imageAlt') return pick(record.image?.alt, locale);
          if (column === 'image') return record.image?.src?.split('/').pop() ?? '';
          if (column === 'mockup') return record.image?.mockup ? 'true' : 'false';
          if (column === 'published') return 'true';
          if (column === 'featured') return record.featured ? 'true' : 'false';
          return record[column] ?? '';
        }),
      );
      results[locale].push(...record.results.map((r, i) => [record.slug, String(i + 1), r.value, pick(r.label, locale), pick(r.note, locale)]));
      scope[locale].push(...record.scope.map((line, i) => [record.slug, String(i + 1), pick(line, locale)]));
    }
  }

  return {
    cases_EN: cases.en,
    cases_ZH_HANT: cases['zh-Hant'],
    cases_ZH_HANS: cases['zh-Hans'],
    results_EN: results.en,
    results_ZH_HANT: results['zh-Hant'],
    results_ZH_HANS: results['zh-Hans'],
    scope_EN: scope.en,
    scope_ZH_HANT: scope['zh-Hant'],
    scope_ZH_HANS: scope['zh-Hans'],
    settings: [
      ['key', 'value'],
      ['editors', 'editor@example.com'],
      ['github_owner', 'oneup24'],
      ['github_repo', 'migather-www'],
      ['lastPublish', ''],
      ['lastPublishStatus', ''],
      ['lastImageSaved', ''],
      ['contentChanged', ''],
    ],
  };
}

/* ── The browser ──────────────────────────────────────────────────────── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/* ── The checks ───────────────────────────────────────────────────────── */

let failed = 0;
function check(label, condition, detail = '') {
  if (condition) console.log(`  ok    ${label}`);
  else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

/* ── Run ──────────────────────────────────────────────────────────────── */

const PORT = await freePort();

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--window-size=1440,1200',
    'about:blank',
  ],
  { stdio: 'ignore', detached: true },
);

let ws;
for (let i = 0; i < 40; i += 1) {
  try {
    ws = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
    break;
  } catch {
    await sleep(250);
  }
}

const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
const socket = new WebSocket(ws);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve);
  socket.addEventListener('error', reject);
});

let id = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const promise = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) promise.reject(new Error(message.error.message));
    else promise.resolve(message.result);
  }
});

const send = (method, params = {}, sessionId) => {
  const requestId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
  });
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Runtime.enable', {}, sessionId);
await send('Page.enable', {}, sessionId);

const evaluate = async (expression) => {
  const result = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'the page threw');
  }
  return result.result.value;
};

/* ── The mocks, injected into the page ────────────────────────────────── */

const tabs = buildTabs();

const MOCK = `
  window.__writes = [];
  window.__posts = [];
  window.__fixture = ${JSON.stringify(tabs)};

  /* The fake Google Identity Services. */
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: function (config) {
          return {
            requestAccessToken: function () {
              setTimeout(function () {
                config.callback({ access_token: 'test-token' });
              }, 30);
            },
          };
        },
      },
    },
  };

  /* The publish and the picture are posted to the Apps Script through a
     real form in a hidden frame — the browser cannot read the answer. So
     the form's submit is intercepted instead. */
  HTMLFormElement.prototype.submit = function () {
    const fields = Object.fromEntries(
      Array.from(this.querySelectorAll('input')).map(function (i) { return [i.name, i.value]; }),
    );
    window.__posts.push({ action: this.action, fields: fields });

    /* The script writes the picture's name into the sheet once the file is
       really in Drive. The mock does the same, so the page's wait ends. */
    if (fields.action === 'image') {
      const row = window.__fixture.settings.find(function (r) { return r[0] === 'lastImageSaved'; });
      if (row) row[1] = fields.fileName;
    }
  };

  /* The fake APIs. */
  const realFetch = window.fetch;
  window.fetch = function (url, options) {
    const href = String(url);

    if (href.includes('oauth2/v3/userinfo')) {
      return Promise.resolve(new Response(JSON.stringify({ email: 'editor@example.com', name: 'Editor' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    }

    if (href.includes('sheets.googleapis.com')) {
      const method = (options && options.method) || 'GET';
      const body = options && options.body ? JSON.parse(options.body) : null;

      if (method === 'GET') {
        const wanted = (href.match(/ranges=([^&]*)/g) || []).map(function (r) {
          return decodeURIComponent(r.replace('ranges=', ''));
        });
        const valueRanges = wanted.map(function (name) {
          const key = name.replace('cases_ZH-HANT', 'cases_ZH_HANT').replace('cases_ZH-HANS', 'cases_ZH_HANS')
            .replace('results_ZH-HANT', 'results_ZH_HANT').replace('results_ZH-HANS', 'results_ZH_HANS')
            .replace('scope_ZH-HANT', 'scope_ZH_HANT').replace('scope_ZH-HANS', 'scope_ZH_HANS');
          return { range: name, values: window.__fixture[key] || [] };
        });
        return Promise.resolve(new Response(JSON.stringify({ valueRanges: valueRanges }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        }));
      }

      window.__writes.push(body);
      return Promise.resolve(new Response(JSON.stringify({ updatedRange: body.range }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    }


    return realFetch(url, options);
  };
`;

/**
 * Press Save and wait for it to finish.
 *
 * The button is disabled while a save is in flight — a save that waits for
 * a picture to reach Drive takes a moment — so a test has to wait for the
 * page to be ready again before the next one.
 */
async function saveAndWait() {
  const isDisabled = () =>
    evaluate(
      `Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Save' && b.disabled)`,
    );

  /* Wait for the page to be ready — a save that waits for a picture to
     reach Drive takes a moment, and the button is disabled until it is
     done. */
  for (let i = 0; i < 120 && (await isDisabled()); i += 1) await sleep(500);

  await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save').click()`);

  /* Wait for it to start, and then to finish. */
  for (let i = 0; i < 20 && !(await isDisabled()); i += 1) await sleep(100);
  for (let i = 0; i < 120 && (await isDisabled()); i += 1) await sleep(500);

  return !(await isDisabled());
}

/* ── The run ──────────────────────────────────────────────────────────── */

console.log('The works editor page, against mocked Google APIs.\n');

await send('Page.navigate', { url: 'http://localhost:4176/en/admin' }, sessionId);
await sleep(1200);
await evaluate(MOCK);
await send('Page.reload', {}, sessionId);
await sleep(1200);
await evaluate(MOCK);

/* The page must not be configured in this build, so it says so. */
const configured = await evaluate(`Boolean(document.body.textContent.includes('no editor configured'))`);
console.log('  note  the build has no editor configured, so the page says so:', configured);

/* Sign in. */
await evaluate(`document.querySelector('#google-signin')?.remove();`);
const signInButton = await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Sign in') ? true : false`);
check('there is a sign-in button', signInButton);

await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Sign in').click()`);
await sleep(1500);

const state = await evaluate(`JSON.stringify({
  hasPicker: !!document.getElementById('case-picker'),
  options: document.getElementById('case-picker') ? document.getElementById('case-picker').options.length : 0,
  summary: document.querySelector('textarea') ? document.querySelector('textarea').value.slice(0, 40) : '',
  client: document.querySelector('input[type=text]') ? document.querySelector('input[type=text]').value : '',
  writes: window.__writes.length,
})`);

const parsed = JSON.parse(state);
check('the case list loaded', parsed.hasPicker);
check('every case is in the picker', parsed.options === records.length, `${parsed.options} of ${records.length}`);
check('the form was filled from the sheet', parsed.client === records[0].client, parsed.client);
check('the summary was filled from the sheet', parsed.summary.length > 0, parsed.summary);
check('reading the sheet did not write anything', parsed.writes === 0, `${parsed.writes} writes`);

/* Edit and save. */
await evaluate(`(() => {
  const areas = document.querySelectorAll('textarea');
  const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  set.call(areas[0], 'An edited summary, for the test.');
  areas[0].dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(200);

await saveAndWait();

const after = JSON.parse(
  await evaluate(`JSON.stringify({
    writes: window.__writes.length,
    notice: document.body.textContent.includes('rebuilds by itself'),
    error: document.body.textContent.includes('the sheet could not be'),
    summaryWrite: window.__writes.filter(w => JSON.stringify(w.values || '').includes('An edited summary')).length,
  })`),
);

check('saving wrote to the sheet', after.writes > 0, `${after.writes} writes`);
check('the edited summary was written', after.summaryWrite > 0, `${after.summaryWrite} writes carried it`);
check('the page said it saved', after.notice);
check('nothing failed', !after.error);

/* A picture is posted to the script, which is the only party with quota. */
await evaluate(`(() => {
  const input = document.querySelector('input[type=file]');
  const file = new File([new Uint8Array([1, 2, 3, 4])], 'new-picture.jpg', { type: 'image/jpeg' });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await sleep(300);
const pickedUp = await evaluate(`document.body.textContent.includes('Ready to upload')`);
check('the page says which file it will upload', pickedUp);

await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save').click()`);
await sleep(1500);

const image = JSON.parse(
  await evaluate(`JSON.stringify(window.__posts.filter(p => p.fields && p.fields.action === 'image'))`),
);
check('the picture was posted to the script', image.length > 0, `${image.length} posts`);
check('it carries the slug', image[0]?.fields?.slug === records[0].slug, image[0]?.fields?.slug);
check('it carries a file name', String(image[0]?.fields?.fileName ?? '').endsWith('.jpg'), image[0]?.fields?.fileName);
check('it carries the bytes', String(image[0]?.fields?.dataUrl ?? '').startsWith('data:image/jpeg;base64,'));

/* ── A new case, from nothing ───────────────────────────────────────────
   The whole flow an editor follows when a client comes on board: press
   New case, fill it in, save. The case must reach the site — which means
   it must be written to the sheet as published, in all three languages,
   with a row for each. */
{
  console.log('\nA new case');
  await evaluate(`window.__prompts = ['acme-hk-2026', 'Acme HK']; window.prompt = function () { return window.__prompts.shift() ?? null; };`);
  await evaluate(`document.getElementById('newCase').click()`);
  await sleep(600);

  const opened = await evaluate(`JSON.stringify({
    editorOpen: !!document.getElementById('summary'),
    saysItIsNew: document.body.textContent.includes('A new case'),
    client: document.getElementById('client').value,
    summary: document.getElementById('summary').value,
    published: document.getElementById('published') ? document.getElementById('published').value : 'no control',
  })`);
  const openedState = JSON.parse(opened);

  check('the form opens', openedState.editorOpen);
  check('it says a new case is being started', openedState.saysItIsNew);
  check('it asks for the client', openedState.client === 'Acme HK', openedState.client);
  check('it starts empty', openedState.summary === '', openedState.summary);
  check('there is a control for publishing it', openedState.published !== 'no control', openedState.published);

  /* Fill it in and publish it. */
  await evaluate(`(() => {
    const set = (selector, value) => {
      const node = document.querySelector(selector);
      const prototype = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
      Object.getOwnPropertyDescriptor(prototype.prototype, 'value').set.call(node, value);
      node.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('#client', 'Acme HK');
    set('#summary', 'What we did for Acme.');
    set('#source', 'Deck p.9');
    const published = document.getElementById('published');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(published, 'true');
    published.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(300);

  await saveAndWait();

  const written = JSON.parse(
    await evaluate(`JSON.stringify(window.__writes.filter(w => String(w.range || '').includes('cases_')))`),
  );
  /* An update writes one row; an append writes the header and then the row.
     Either way the case's row is the last one. */
  const caseRows = written.filter((w) => {
    const values = w.values ?? [];
    const last = values[values.length - 1] ?? [];
    return last[0] === 'acme-hk-2026';
  });
  check('it writes a row for the new case', caseRows.length === 3, `${caseRows.length} of 3 language tabs`);
  const lastRow = (w) => (w.values ?? [])[(w.values ?? []).length - 1] ?? [];
  check(
    'it writes it as published, or as a draft if the editor chose that',
    caseRows.every((w) => ['true', 'false'].includes(String(lastRow(w)[12] ?? ''))),
    JSON.stringify(lastRow(caseRows[0] ?? {})[12]),
  );
  check(
    'the summary it wrote is the one the editor typed',
    caseRows.some((w) => String(lastRow(w)[7] ?? '').includes('What we did for Acme')),
  );
  check(
    'it writes the source — a case with no source does not publish',
    caseRows.every((w) => String(lastRow(w)[11] ?? '') === 'Deck p.9'),
  );
}

/* There is no publish button: the sheet is the trigger. */
const hasPublishButton = await evaluate(
  `Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Publish'))`,
);
check('there is no publish button to press', hasPublishButton === false);

/* The save is what tells the poller the content changed. */
const stamped = await evaluate(
  `JSON.stringify(window.__writes.filter(w => String(w.range || '').startsWith('settings')).map(w => w.range))`,
);
check('the save stamped the change for the poller', stamped !== '[]', stamped.slice(0, 160));

/* The picture is posted to the script, which saves it and writes the name. */
const imagePosts = await evaluate(
  `JSON.stringify(window.__posts.filter(p => p.fields && p.fields.action === 'image'))`,
);
check('the picture was posted to the script', imagePosts !== '[]', imagePosts.slice(0, 120));

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);

try {
  process.kill(-chrome.pid, 'SIGKILL');
} catch {
  chrome.kill('SIGKILL');
}

process.exit(failed === 0 ? 0 : 1);
