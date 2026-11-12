/**
 * Records and rows — the two shapes the content exists in.
 *
 * A *record* is the compiled case: one file, `content/cases/<slug>.json`,
 * with all three locales merged. It is what the site reads.
 *
 * A *row* is a line in a sheet tab. The sheet is the editing surface, and it
 * is flat by necessity — one locale per tab, one column per field.
 *
 * These two functions are inverses of each other, and the round trip is the
 * acceptance test for the migration: a case pushed into the sheet and pulled
 * back out must produce the same record, byte for byte.
 */
import {
  CASE_COLUMNS,
  GALLERY_COLUMNS,
  LOCALES,
  MOCK_UP_PREFIX,
  RESULT_COLUMNS,
  SCOPE_COLUMNS,
} from './schema.mjs';

/**
 * Strip the mock-up prefix from an alt string.
 *
 * The editor is told to type plain alt text, but a prefix that was copied
 * back from a compiled file must not turn into "Mock-up: Mock-up: …". The
 * prefix is therefore removed before it is added.
 */
export function stripMockUpPrefix(alt, locale) {
  const prefix = MOCK_UP_PREFIX[locale];
  if (!prefix) return alt;
  const lower = alt.toLowerCase();
  if (lower.startsWith(prefix.toLowerCase())) return alt.slice(prefix.length).trimStart();
  return alt;
}

/**
 * Apply the mock-up prefix to an alt string.
 *
 * A mock-up says so in the alt text, so a screen-reader user is never told a
 * photograph of Hong Kong is a photograph of a client campaign. Real
 * photography is left unprefixed.
 */
export function applyMockUpPrefix(alt, locale, isMockup) {
  const base = stripMockUpPrefix(String(alt ?? '').trim(), locale);
  if (!isMockup) return base;
  return `${MOCK_UP_PREFIX[locale] ?? ''}${base}`;
}

/** A localised value, in the key order the site expects. */
function localised(values) {
  const out = {};
  for (const locale of LOCALES) out[locale] = values[locale] ?? '';
  return out;
}

/**
 * Build the compiled record for one case.
 *
 * The key order here is the key order in the file on disk. It is fixed, so
 * two runs of the sync produce identical bytes and a diff of a published
 * change shows only the copy that changed.
 */
export function buildRecord({
  slug,
  order,
  client,
  clientLocal,
  projectLocal,
  sector,
  services,
  partnershipSince,
  featured,
  published,
  summary,
  results,
  scope,
  gallery,
  source,
  image,
}) {
  return {
    slug,
    order,
    client,
    clientLocal: localised(clientLocal ?? {}),
    projectLocal: localised(projectLocal ?? {}),
    sector,
    services: [...services],
    partnershipSince: partnershipSince ? localised(partnershipSince) : null,
    featured,
    published,
    summary: localised(summary ?? {}),
    results: results.map((r) => ({
      value: r.value,
      label: localised(r.label ?? {}),
      note: r.note ? localised(r.note) : null,
    })),
    scope: scope.map((s) => localised(s)),
    /* The frames, in reading order. A frame carries the same things a
       banner carries — a file, alt text in three languages and a mock-up
       flag — and a caption, which is the campaign element it stands for. */
    gallery: (gallery ?? []).map((frame) => ({
      src: frame.src,
      alt: localised(frame.alt ?? {}),
      caption: localised(frame.caption ?? {}),
      mockup: Boolean(frame.mockup),
    })),
    source,
    image: image
      ? {
          src: image.src,
          alt: localised(image.alt ?? {}),
          mockup: Boolean(image.mockup),
        }
      : null,
  };
}

/**
 * The canonical serialisation of a record.
 *
 * Two spaces, a trailing newline, and no re-ordering: this is what lands in
 * git, so it has to be stable.
 */
export function serialiseRecord(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The image file name of a record.
 *
 * The sheet's `image` column holds the file name inside the case's Drive
 * folder; the compiled `src` is that file name under the case's folder. The
 * file name is therefore recoverable from the compiled record, which is what
 * lets the seed push a record into the sheet without a side table.
 */
export function imageFileName(record) {
  const src = record.image?.src ?? '';
  const name = src.split('/').pop() ?? '';
  return name;
}

/**
 * A record as the rows of the `cases_<locale>` tab.
 *
 * The locale-independent columns are written identically into all three
 * tabs — that repetition is what the sync's agreement check reads back.
 */
export function recordToCaseRows(record, locale) {
  const mockup = Boolean(record.image?.mockup);
  const plainAlt = stripMockUpPrefix(record.image?.alt?.[locale] ?? '', locale);

  const shared = {
    slug: record.slug,
    client: record.client,
    sector: record.sector,
    services: record.services.join(', '),
    image: imageFileName(record),
    mockup: mockup ? 'true' : 'false',
    source: record.source,
    featured: record.featured ? 'true' : 'false',
    published: record.published ? 'true' : 'false',
  };

  const localisedFields = {
    clientLocal: record.clientLocal?.[locale] ?? '',
    projectLocal: record.projectLocal?.[locale] ?? '',
    partnershipSince: record.partnershipSince?.[locale] ?? '',
    summary: record.summary?.[locale] ?? '',
    imageAlt: plainAlt,
  };

  const row = {};
  for (const column of CASE_COLUMNS) {
    row[column] = column in localisedFields ? localisedFields[column] : shared[column];
  }
  return row;
}

/** The rows of the `results_<locale>` tab for one case. */
export function recordToResultRows(record, locale) {
  return record.results.map((result, index) => ({
    slug: record.slug,
    order: String(index + 1),
    value: result.value,
    label: result.label?.[locale] ?? '',
    note: result.note?.[locale] ?? '',
  }));
}

/** The rows of the `scope_<locale>` tab for one case. */
export function recordToScopeRows(record, locale) {
  return record.scope.map((line, index) => ({
    slug: record.slug,
    order: String(index + 1),
    text: line?.[locale] ?? '',
  }));
}

/**
 * The rows of the `gallery_<locale>` tab for one case.
 *
 * The file name and the mock-up flag are the same in every language — they
 * belong to the picture — so they are written identically into all three
 * tabs. The alt text and the caption are copy, and each language carries
 * its own; the alt text is written without the mock-up prefix, because the
 * compiler adds it.
 */
export function recordToGalleryRows(record, locale) {
  return (record.gallery ?? []).map((frame, index) => ({
    slug: record.slug,
    order: String(index + 1),
    file: frame.src.split('/').pop() ?? '',
    alt: stripMockUpPrefix(frame.alt?.[locale] ?? '', locale),
    caption: frame.caption?.[locale] ?? '',
    mockup: frame.mockup ? 'true' : 'false',
  }));
}

/** The header rows, in column order. */
export function headerRow(columns) {
  return [...columns];
}

/** A row object as the flat array the Sheets API takes. */
export function rowToArray(row, columns) {
  return columns.map((column) => row[column] ?? '');
}

/** True when the two rows carry the same value for a column. */
export function sameValue(a, b) {
  return String(a ?? '').trim() === String(b ?? '').trim();
}

export { CASE_COLUMNS, GALLERY_COLUMNS, RESULT_COLUMNS, SCOPE_COLUMNS };
