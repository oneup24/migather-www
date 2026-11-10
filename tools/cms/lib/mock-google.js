/**
 * A fake Google, for previewing and testing the editor page.
 *
 * The editor page talks to three things — Google Identity, the Sheets API
 * and the Apps Script — and none of them can be reached from a test or a
 * preview. So this is a stand-in for all three: a button that hands out a
 * token, a Sheets API backed by the real compiled case files, and a script
 * that records what it was asked to do.
 *
 * It is a string, because it is injected into the page as a script.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

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

/** The compiled case files, shaped like sheet tabs. */
export function buildFixture() {
  const records = readdirSync(join(ROOT, 'content', 'cases'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(readFileSync(join(ROOT, 'content', 'cases', file), 'utf8')))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const cases = { en: [CASE_COLUMNS], 'zh-Hant': [CASE_COLUMNS], 'zh-Hans': [CASE_COLUMNS] };
  const results = {
    en: [['slug', 'order', 'value', 'label', 'note']],
    'zh-Hant': [['slug', 'order', 'value', 'label', 'note']],
    'zh-Hans': [['slug', 'order', 'value', 'label', 'note']],
  };
  const scope = {
    en: [['slug', 'order', 'text']],
    'zh-Hant': [['slug', 'order', 'text']],
    'zh-Hans': [['slug', 'order', 'text']],
  };

  for (const record of records) {
    for (const locale of ['en', 'zh-Hant', 'zh-Hans']) {
      cases[locale].push(
        CASE_COLUMNS.map((column) => {
          if (column === 'slug') return record.slug;
          if (column === 'services') return record.services.join(', ');
          if (column === 'clientLocal') return pick(record.clientLocal, locale);
          if (column === 'projectLocal') return pick(record.projectLocal, locale);
          if (column === 'summary') return pick(record.summary, locale);
          if (column === 'imageAlt') {
            // The sheet holds the plain alt text; the sync adds the mock-up
            // prefix on the way in. The editor must not see the prefix.
            const prefix = { en: 'Mock-up: ', 'zh-Hant': '樣機：', 'zh-Hans': '样机：' }[locale];
            const alt = pick(record.image?.alt, locale);
            return prefix && alt.startsWith(prefix) ? alt.slice(prefix.length).trim() : alt;
          }
          if (column === 'image') return record.image?.src?.split('/').pop() ?? '';
          if (column === 'mockup') return record.image?.mockup ? 'true' : 'false';
          if (column === 'partnershipSince') return pick(record.partnershipSince, locale);
          if (column === 'published') return 'true';
          if (column === 'featured') return record.featured ? 'true' : 'false';
          return record[column] ?? '';
        }),
      );
      results[locale].push(
        ...record.results.map((r, i) => [
          record.slug,
          String(i + 1),
          r.value,
          pick(r.label, locale),
          pick(r.note, locale),
        ]),
      );
      scope[locale].push(
        ...record.scope.map((line, i) => [record.slug, String(i + 1), pick(line, locale)]),
      );
    }
  }

  return {
    records,
    tabs: {
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
      ],
    },
  };
}

/**
 * The mock, as a string.
 *
 * `editor@example.com` is on the allow-list, so the page opens straight
 * into the form. The sign-in button is not shown, because the mock grants
 * the token without a popup.
 */
export function mockScript(tabs) {
  return `
  window.__writes = [];
  window.__posts = [];
  window.__fixture = ${JSON.stringify(tabs)};

  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: function (config) {
          return {
            requestAccessToken: function () {
              setTimeout(function () { config.callback({ access_token: 'test-token' }); }, 30);
            },
          };
        },
      },
    },
  };

  /* The picture and the publish are posted to the Apps Script through a real
     form in a hidden frame — the browser cannot read the answer. So the
     form's submit is intercepted instead. */
  HTMLFormElement.prototype.submit = function () {
    window.__posts.push({
      action: this.action,
      fields: Object.fromEntries(
        Array.from(this.querySelectorAll('input')).map(function (i) { return [i.name, i.value]; }),
      ),
    });
  };

  const realFetch = window.fetch;
  window.fetch = function (url, options) {
    const href = String(url);
    const method = (options && options.method) || 'GET';

    if (href.includes('oauth2/v3/userinfo')) {
      return Promise.resolve(new Response(
        JSON.stringify({ email: 'editor@example.com', name: 'Editor' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ));
    }

    if (href.includes('sheets.googleapis.com')) {
      const body = options && options.body ? JSON.parse(options.body) : null;

      if (method === 'GET') {
        const wanted = (href.match(/ranges=([^&]*)/g) || []).map(function (r) {
          return decodeURIComponent(r.replace('ranges=', ''));
        });
        const valueRanges = wanted.map(function (name) {
          const key = name
            .replace('cases_ZH-HANT', 'cases_ZH_HANT')
            .replace('cases_ZH-HANS', 'cases_ZH_HANS')
            .replace('results_ZH-HANT', 'results_ZH_HANT')
            .replace('results_ZH-HANS', 'results_ZH_HANS')
            .replace('scope_ZH-HANT', 'scope_ZH_HANT')
            .replace('scope_ZH-HANS', 'scope_ZH_HANS');
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
}
