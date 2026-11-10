/**
 * The form preview — render the Apps Script template locally, with mock data.
 *
 * The editor form in `apps-script/Index.html` is an Apps Script template: it
 * is not a static page, and it cannot be opened in a browser as it stands.
 * This renders it the way Apps Script does — evaluating the scriptlets with
 * a mock context — and serves it, so the form can be reviewed before anyone
 * creates a Google project.
 *
 * The mock is honest about what it is. The layout, the copy, the case picker
 * and the interactions are the real ones. The data behind them is the
 * compiled case content, read from `content/cases/`. What is missing is the
 * one thing a browser cannot have: `google.script.run`, the bridge to the
 * Apps Script server. It is stubbed here, so the form loads a case and
 * saves it — to nothing. The save button answers with the same message the
 * real script returns.
 *
 * Usage:
 *   node tools/cms/preview-form.mjs [--port 4180]
 *
 * Then open the printed URL.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { LOCALES } from './lib/schema.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TEMPLATE = join(ROOT, 'apps-script', 'Index.html');
const CONTENT_DIR = join(ROOT, 'content', 'cases');

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};
const PORT = Number(argOf('--port', 4180));

/* ── The mock context ─────────────────────────────────────────────────── */

const records = readdirSync(CONTENT_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf8')))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/** The cases as the picker shows them. */
const cases = records.map((record) => ({
  slug: record.slug,
  client: record.client,
  ready: LOCALES.filter((locale) => record.summary?.[locale]).length,
  total: LOCALES.length,
  published: record.published !== false,
}));

/** The vocabulary, as the settings tab carries it. */
const sectors = [...new Set(records.map((record) => record.sector))].sort();

/**
 * The service keys the form offers.
 *
 * All of them, not just the ones the sixteen cases happen to use — the
 * settings tab carries the site's full service menu, and the form has to
 * offer a key a case could be given tomorrow.
 */
const { allServices } = await import(join(ROOT, 'src', 'data', 'services.js'));
const services = allServices.map((service) => service.key);

/* ── The template renderer ────────────────────────────────────────────── */

/**
 * Evaluate an Apps Script template.
 *
 * `<? code ?>` runs, `<?= expression ?>` prints. The code can span several
 * scriptlets — a `for` loop opened in one and closed in the next — so the
 * whole template is compiled as one function body rather than evaluated
 * piece by piece.
 */
function renderTemplate(source, context) {
  const body = [];
  const names = Object.keys(context);

  let index = 0;
  while (index < source.length) {
    const open = source.indexOf('<?', index);
    if (open === -1) {
      body.push(`__out.push(${JSON.stringify(source.slice(index))});`);
      break;
    }

    if (open > index) body.push(`__out.push(${JSON.stringify(source.slice(index, open))});`);

    const close = source.indexOf('?>', open);
    if (close === -1) throw new Error('the template has an unclosed scriptlet');

    const scriptlet = source.slice(open + 2, close).trim();
    if (scriptlet.startsWith('=')) {
      body.push(`__out.push(String(${scriptlet.slice(1).trim()}));`);
    } else {
      body.push(scriptlet);
    }

    index = close + 2;
  }

  const factory = new Function(
    '__out',
    ...names,
    `${body.join('\n')}\nreturn __out.join('');`,
  );

  const out = [];
  factory(out, ...names.map((name) => context[name]));
  return out.join('');
}

/* ── The stub for `google.script.run` ─────────────────────────────────── */

/**
 * The bridge to the Apps Script server, stubbed.
 *
 * `load` answers with the real compiled record, shaped the way the script
 * shapes it. `save` and `publish` answer with the message the script would
 * return, and change nothing.
 */
const STUB = `
<script>
  (function () {
    var RECORDS = __RECORDS__;
    var LOCALES = __LOCALES__;

    function pick(value, locale) {
      if (value == null) return '';
      if (typeof value === 'string') return value;
      if (typeof value !== 'object') return String(value);
      var direct = value[locale];
      if (typeof direct === 'string' && direct.length) return direct;
      var fallback = value.en;
      if (typeof fallback === 'string' && fallback.length) return fallback;
      return '';
    }

    function loadCase(slug, locale) {
      var record = RECORDS[slug];
      if (!record) return { ok: false, error: 'there is no case called ' + slug };
      var results = (record.results || []).map(function (result) {
        return {
          value: result.value,
          label: pick(result.label, locale),
          note: pick(result.note, locale),
        };
      });
      var scope = (record.scope || []).map(function (line) {
        return { text: pick(line, locale) };
      });
      var ready = LOCALES.filter(function (each) {
        return record.summary && record.summary[each];
      }).length;

      // The sheet stores the plain alt text; the sync adds the mock-up
      // prefix on the way in. The editor must not see the prefix, or they
      // will type it twice — so it is stripped here, the way the sheet
      // has it.
      var alt = pick(record.image && record.image.alt, locale);
      var prefix = { en: 'Mock-up: ', 'zh-Hant': '樣機：', 'zh-Hans': '样机：' }[locale];
      if (prefix && alt.indexOf(prefix) === 0) alt = alt.slice(prefix.length).trim();

      return {
        ok: true,
        case: {
          slug: slug,
          locale: locale,
          values: {
            slug: record.slug,
            client: record.client,
            clientLocal: pick(record.clientLocal, locale),
            projectLocal: pick(record.projectLocal, locale),
            sector: record.sector,
            services: (record.services || []).join(', '),
            partnershipSince: pick(record.partnershipSince, locale),
            summary: pick(record.summary, locale),
            source: record.source,
            imageAlt: alt,
            image: record.image ? record.image.src.split('/').pop() : '',
            mockup: record.image ? record.image.mockup : false,
            featured: record.featured,
            published: record.published,
          },
          results: results,
          scope: scope,
          readiness: { ready: ready, total: LOCALES.length },
          published: record.published,
        },
      };
    }

    var runner = {
      _ok: function () {},
      _fail: function () {},
      withSuccessHandler: function (fn) { runner._ok = fn; return runner; },
      withFailureHandler: function (fn) { runner._fail = fn; return runner; },
      api: function (action, payload) {
        var data = {};
        try { data = JSON.parse(payload || '{}'); } catch (error) { data = {}; }
        setTimeout(function () {
          try {
            if (action === 'load') {
              runner._ok(loadCase(data.slug, data.locale));
              return;
            }
            var ready = LOCALES.filter(function (each) { return true; }).length;
            runner._ok({
              ok: true,
              result: {
                slug: data.slug,
                published: action === 'publish',
                readiness: { ready: ready, total: LOCALES.length },
                publishedNow: action === 'publish',
                message:
                  action === 'publish'
                    ? 'Saved and published. The site rebuilds in a couple of minutes.'
                    : 'Saved as a draft. 3 of 3 languages are ready.',
              },
            });
          } catch (error) {
            runner._fail(error);
          }
        }, 120);
      },
    };

    window.google = { script: { run: runner } };
    window.__PREVIEW__ = true;
  })();
</script>
`;

/* ── The server ───────────────────────────────────────────────────────── */

const context = {
  cases,
  sectors,
  services,
  allowedEditors: 'editor@example.com',
  signedInAs: 'editor@example.com',
  permitted: true,
  message: '',
};

const html = renderTemplate(readFileSync(TEMPLATE, 'utf8'), context);

/**
 * Substitution uses a replacer function, not a string.
 *
 * A string replacement interprets `$&`, `$'` and `` $` `` inside the
 * replacement as patterns, and the case content contains dollar signs — one
 * of the copy blocks quotes a price. A function replacer inserts the text
 * literally.
 */
const inject = (source, needle, value) => source.replace(needle, () => value);

const stub = inject(
  inject(
    STUB,
    '__RECORDS__',
    JSON.stringify(Object.fromEntries(records.map((record) => [record.slug, record]))),
  ),
  '__LOCALES__',
  JSON.stringify(LOCALES),
);

const page = inject(html, '</head>', `${stub}</head>`);

const server = createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(page);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`The editor form, rendered with mock data:\n  http://localhost:${PORT}\n`);
  console.log(`${cases.length} cases, ${sectors.length} sectors, ${services.length} services.`);
  console.log('This is a preview. Nothing it shows is connected to a sheet, and nothing you');
  console.log('do here is saved anywhere.');
});
