/**
 * The content contract — the sheet, the columns and the vocabulary.
 *
 * This module is the single description of what the CMS stores. The Apps
 * Script, the sync, the seed and the content check all read it, so a column
 * cannot be renamed in one place and missed in another.
 *
 * Nine tabs, one per (kind × locale). One locale per tab, so the editing
 * form never shows two Chinese scripts at once and a missing translation is
 * visible as a missing tab row rather than as a blank field.
 */

/** The three locales, in the order they are published. */
export const LOCALES = ['en', 'zh-Hant', 'zh-Hans'];

/** Sheet tab names. */
export const CASE_TABS = {
  en: 'cases_EN',
  'zh-Hant': 'cases_ZH-HANT',
  'zh-Hans': 'cases_ZH-HANS',
};

export const RESULT_TABS = {
  en: 'results_EN',
  'zh-Hant': 'results_ZH-HANT',
  'zh-Hans': 'results_ZH-HANS',
};

export const SCOPE_TABS = {
  en: 'scope_EN',
  'zh-Hant': 'scope_ZH-HANT',
  'zh-Hans': 'scope_ZH-HANS',
};

/** Every tab the sheet must carry, in the order they are created. */
export const ALL_TABS = [
  ...LOCALES.map((l) => CASE_TABS[l]),
  ...LOCALES.map((l) => RESULT_TABS[l]),
  ...LOCALES.map((l) => SCOPE_TABS[l]),
];

/**
 * The columns of `cases_<locale>`.
 *
 * The locale-independent columns (slug, client, sector, services, source,
 * image, mockup, featured, published) are repeated in all three tabs and must
 * agree — that agreement is the check that catches a client name edited in
 * one language only.
 */
export const CASE_COLUMNS = [
  'slug',
  'client',
  'clientLocal',
  'projectLocal',
  'sector',
  'services',
  'partnershipSince',
  'summary',
  'imageAlt',
  'image',
  'mockup',
  'source',
  'featured',
  'published',
];

/**
 * The columns of `results_<locale>` — one row per result.
 *
 * `value` is a figure, not copy: it is repeated in every tab and must agree.
 */
export const RESULT_COLUMNS = ['slug', 'order', 'value', 'label', 'note'];

/** The columns of `scope_<locale>` — one row per scope line. */
export const SCOPE_COLUMNS = ['slug', 'order', 'text'];

/**
 * The columns that must hold the same value in all three locale tabs.
 *
 * Anything in this list that differs between two tabs fails the build.
 */
export const LOCALE_INDEPENDENT_COLUMNS = [
  'slug',
  'client',
  'sector',
  'services',
  'image',
  'mockup',
  'source',
  'featured',
  'published',
];

/** A route id. Also the Drive folder name for the case. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The mock-up prefix on the alt text.
 *
 * The editor types plain alt text; the sync adds the prefix, so it is never
 * typed twice. The Chinese forms match the wording already on the site
 * (樣機 / 样机).
 */
export const MOCK_UP_PREFIX = {
  en: 'Mock-up: ',
  'zh-Hant': '樣機：',
  'zh-Hans': '样机：',
};

/** Where a case image lives, relative to the site root. */
export const CASE_IMAGE_DIR = '/media/cases';

/** The compiled content, relative to the repository root. */
export const CONTENT_DIR = 'content/cases';

/** The compiled images, relative to the repository root. */
export const PUBLIC_CASE_IMAGE_DIR = 'public/media/cases';

/** The widest an image is served at. Anything larger is resized down. */
export const IMAGE_MAX_WIDTH = 1600;

/**
 * The sectors a case may carry.
 *
 * Read from `src/data/sectors.js` at runtime rather than duplicated here, so
 * the sheet's dropdown and the site's taxonomy cannot drift apart.
 */

/**
 * Read a sheet range into row objects keyed by the header row.
 *
 * The Sheets API returns an array of arrays; the first row is the header.
 * Rows shorter than the header are padded with empty strings, because a
 * trailing empty cell is simply not sent.
 */
export function rowsToObjects(values, columns) {
  if (!values || values.length === 0) return { header: [], rows: [], missing: columns };

  const header = values[0].map((h) => String(h ?? '').trim());
  const missing = columns.filter((c) => !header.includes(c));

  const rows = values.slice(1).map((row, index) => {
    const object = {};
    header.forEach((name, i) => {
      object[name] = row[i] === undefined || row[i] === null ? '' : String(row[i]).trim();
    });
    return { __row: index + 2, __values: object };
  });

  return { header, rows, missing };
}

/** Parse a `true` / `false` cell. Returns null when the cell is neither. */
export function parseBoolean(value) {
  const v = String(value ?? '').trim().toLowerCase();
  if (v === 'true' || v === 'yes' || v === '1') return true;
  if (v === 'false' || v === 'no' || v === '0') return false;
  return null;
}

/** Split a comma-separated list into trimmed, non-empty entries. */
export function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
