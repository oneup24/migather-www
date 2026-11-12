/**
 * The compiler — nine sheet tabs in, compiled case files out.
 *
 * Everything here is pure: it takes the raw values of the content tabs and
 * returns the records plus the list of things that are wrong with them. No
 * network, no filesystem. That is what makes the migration testable — the
 * same input always produces the same output, so a case pushed into the
 * sheet and pulled back out has to come back byte for byte identical.
 *
 * The rules are deliberately strict. The site publishes sourced figures next
 * to pictures of Hong Kong; a case that is half-filled, or that names a
 * service the site does not offer, or that has no source, must not reach
 * the build. A failed sync leaves the last good content in place.
 */
import {
  CASE_COLUMNS,
  CASE_TABS,
  GALLERY_COLUMNS,
  GALLERY_MAX_FRAMES,
  GALLERY_TABS,
  LOCALES,
  LOCALE_INDEPENDENT_COLUMNS,
  RESULT_COLUMNS,
  RESULT_TABS,
  SCOPE_COLUMNS,
  SCOPE_TABS,
  SLUG_PATTERN,
  splitList,
  parseBoolean,
  rowsToObjects,
} from './schema.mjs';
import { applyMockUpPrefix, buildRecord, stripMockUpPrefix } from './records.mjs';

/** The image path a case's file lands on. */
function caseImagePath(slug, fileName) {
  return `/media/cases/${slug}/${fileName}`;
}

/**
 * Parse one tab into rows keyed by column name.
 *
 * A tab that is missing entirely is an error in its own right: the sheet has
 * to carry all nine, because a missing tab means a missing language.
 *
 * The gallery tabs are the exception. A case may have no frames at all, and
 * a sheet that has never had a frame in it need not carry the tabs — so an
 * empty gallery tab is nothing, not a failure.
 */
function parseTab(values, columns, tabName, errors, { optional = false } = {}) {
  const { header, rows, missing } = rowsToObjects(values, columns);

  if (!values || values.length === 0) {
    if (!optional) {
      errors.push({ tab: tabName, message: 'the tab is empty — it must at least carry a header row' });
    }
    return [];
  }

  if (missing.length > 0) {
    errors.push({
      tab: tabName,
      message: `the header row is missing the column(s) ${missing.join(', ')}`,
    });
  }

  const unknown = header.filter((h) => h && !columns.includes(h));
  if (unknown.length > 0) {
    errors.push({
      tab: tabName,
      message: `the header row carries the unknown column(s) ${unknown.join(', ')}`,
    });
  }

  return rows;
}

/** Group rows by slug, reporting a duplicate. */
function groupBySlug(rows, tabName, errors) {
  const groups = new Map();

  for (const row of rows) {
    const slug = row.__values.slug;
    if (!slug) {
      errors.push({ tab: tabName, row: row.__row, message: 'the row has no slug' });
      continue;
    }
    if (!SLUG_PATTERN.test(slug)) {
      errors.push({
        tab: tabName,
        row: row.__row,
        slug,
        message: `the slug "${slug}" is not a valid route id (lowercase letters, digits and single hyphens)`,
      });
      continue;
    }
    if (groups.has(slug)) {
      errors.push({
        tab: tabName,
        row: row.__row,
        slug,
        message: `the slug "${slug}" appears more than once in this tab`,
      });
      continue;
    }
    groups.set(slug, row);
  }

  return groups;
}

/** The normalised value of a locale-independent column, for comparison. */
function comparable(column, raw) {
  if (column === 'services') return splitList(raw).join(',');
  if (column === 'mockup' || column === 'featured' || column === 'published') {
    return String(parseBoolean(raw));
  }
  return String(raw ?? '').trim();
}

/**
 * Compile the sheet tabs into records.
 *
 * @param {object} input
 * @param {object} input.cases    the `cases_<locale>` tabs, raw values
 * @param {object} input.results  the `results_<locale>` tabs, raw values
 * @param {object} input.scope    the `scope_<locale>` tabs, raw values
 * @param {object} [input.gallery] the `gallery_<locale>` tabs, raw values
 * @param {string[]} input.sectors   the allowed sector keys
 * @param {string[]} input.services  the allowed service keys
 * @param {boolean} [input.strict]   fail on a draft case with a bad column too
 */
export function compile(input, { sectors = [], services = [] } = {}) {
  const errors = [];
  const warnings = [];

  /* ── 1. Parse the tabs ──────────────────────────────────────────── */
  const caseRows = {};
  for (const locale of LOCALES) {
    const tab = CASE_TABS[locale];
    caseRows[locale] = parseTab(input.cases?.[locale], CASE_COLUMNS, tab, errors);
  }

  const resultRows = {};
  for (const locale of LOCALES) {
    const tab = RESULT_TABS[locale];
    resultRows[locale] = parseTab(input.results?.[locale], RESULT_COLUMNS, tab, errors);
  }

  const scopeRows = {};
  for (const locale of LOCALES) {
    const tab = SCOPE_TABS[locale];
    scopeRows[locale] = parseTab(input.scope?.[locale], SCOPE_COLUMNS, tab, errors);
  }

  const galleryRows = {};
  for (const locale of LOCALES) {
    const tab = GALLERY_TABS[locale];
    galleryRows[locale] = parseTab(input.gallery?.[locale], GALLERY_COLUMNS, tab, errors, {
      optional: true,
    });
  }

  /* ── 2. Group by slug ───────────────────────────────────────────── */
  const byLocale = {};
  for (const locale of LOCALES) {
    byLocale[locale] = groupBySlug(caseRows[locale], CASE_TABS[locale], errors);
  }

  // The canonical order is the row order of the English tab.
  const order = [...byLocale.en.keys()];

  // Every slug that appears anywhere.
  const slugs = new Set();
  for (const locale of LOCALES) for (const slug of byLocale[locale].keys()) slugs.add(slug);
  for (const slug of slugs) if (!order.includes(slug)) order.push(slug);

  /* ── 3. The locale-independent fields must agree ─────────────────── */
  const published = new Set();

  for (const slug of slugs) {
    const present = LOCALES.filter((l) => byLocale[l].has(slug));

    for (const column of LOCALE_INDEPENDENT_COLUMNS) {
      const values = present.map((locale) => ({
        locale,
        value: comparable(column, byLocale[locale].get(slug).__values[column]),
      }));
      const first = values[0];
      const clash = values.find((v) => v.value !== first.value);
      if (!clash) continue;

      /* A warning, not a failure. The columns are written into all three
         tabs by the editor's page, so a difference means the sheet was edited
         by hand — worth saying, but not worth stopping the site for. The
         site publishes the English value and carries on. */
      warnings.push({
        tab: `${CASE_TABS[first.locale]} / ${CASE_TABS[clash.locale]}`,
        slug,
        column,
        message:
          `the ${column} column differs between locales — "${first.value}" in ${first.locale}, ` +
          `"${clash.value}" in ${clash.locale}`,
      });
    }

    const flags = present.map((locale) => parseBoolean(byLocale[locale].get(slug).__values.published));
    const isPublished = flags.length > 0 && flags.every((f) => f === true);
    if (flags.some((f) => f === null)) {
      warnings.push({
        tab: 'the cases tabs',
        slug,
        column: 'published',
        message: 'the published column must be true or false — it is read as false',
      });
    }
    if (isPublished) published.add(slug);
  }

  /* ── 4. Per-case checks ─────────────────────────────────────────── */
  const records = [];

  for (const slug of order) {
    const en = byLocale.en.get(slug);
    const isPublished = published.has(slug);
    const present = LOCALES.filter((l) => byLocale[l].has(slug));

    /* The vocabulary. */
    const sector = en ? en.__values.sector : (byLocale[present[0]].get(slug)?.__values.sector ?? '');
    if (!sectors.includes(sector)) {
      errors.push({
        tab: 'the cases tabs',
        slug,
        column: 'sector',
        message: `"${sector}" is not a sector the site knows — expected one of ${sectors.join(', ')}`,
      });
    }

    const serviceKeys = splitList(en ? en.__values.services : '');
    for (const key of serviceKeys) {
      if (services.includes(key)) continue;
      errors.push({
        tab: 'the cases tabs',
        slug,
        column: 'services',
        message: `"${key}" is not a service the site offers — check the key against the service menu`,
      });
    }

    const mockupRaw = en ? en.__values.mockup : '';
    const mockup = parseBoolean(mockupRaw);
    if (mockup === null) {
      warnings.push({
        tab: 'the cases tabs',
        slug,
        column: 'mockup',
        message: 'the mockup column must be true or false',
      });
    }

    const featuredRaw = en ? en.__values.featured : '';
    const featured = parseBoolean(featuredRaw);
    if (featured === null) {
      warnings.push({
        tab: 'the cases tabs',
        slug,
        column: 'featured',
        message: 'the featured column must be true or false',
      });
    }

    /* A draft is allowed to be unfinished. A published case is not. */
    if (!isPublished) {
      if (present.length < LOCALES.length) {
        // A draft that has not been started in every language is the normal
        // state of a work in progress, so it is a note, not a failure.
        warnings.push({
          slug,
          message: `the draft is missing from ${LOCALES.filter((l) => !present.includes(l)).join(', ')}`,
        });
      }
      continue;
    }

    /* A published case must exist in every language. */
    for (const locale of LOCALES) {
      if (byLocale[locale].has(slug)) continue;
      /* A case being translated appears in one language first. That is the
         normal state of the work, and the site falls back to English for
         what is missing — so it is a note, not a failure. */
      warnings.push({
        tab: CASE_TABS[locale],
        slug,
        message: `the case is missing from ${locale} — it shows in English there until it is translated`,
      });
    }
    if (present.length < LOCALES.length) continue;

    /* The source is the rule the whole site runs on. */
    const source = en.__values.source;
    if (!source) {
      errors.push({
        tab: 'the cases tabs',
        slug,
        column: 'source',
        message: 'a published case must name the deck and slide it came from',
      });
    }

    /* The image, and the file it names. */
    const imageFile = en.__values.image;
    if (!imageFile) {
      errors.push({
        tab: 'the cases tabs',
        slug,
        column: 'image',
        message: 'a published case must have an image',
      });
    }

    /* The copy, in every language. */
    const localised = {};
    let hasSummary = false;
    for (const locale of LOCALES) {
      const row = byLocale[locale].get(slug).__values;
      localised[locale] = row;

      if (!row.summary) {
        /* A summary missing in one language is a translation in progress.
           A summary missing in every language is an empty page, and that
           stops the publish. */
        warnings.push({
          tab: CASE_TABS[locale],
          slug,
          column: 'summary',
          message: `the case has no summary in ${locale} — it shows in English there`,
        });
      } else {
        hasSummary = true;
      }
      if (!row.imageAlt) {
        warnings.push({
          tab: CASE_TABS[locale],
          slug,
          column: 'imageAlt',
          message: `the case has no alt text in ${locale} — it falls back to the English alt text`,
        });
      }
      if (!row.client) {
        warnings.push({
          tab: CASE_TABS[locale],
          slug,
          column: 'client',
          message: `the case has no client name in ${locale} — it falls back to the English one`,
        });
      }
    }

    if (!hasSummary) {
      errors.push({
        tab: 'the cases tabs',
        slug,
        column: 'summary',
        message: 'a published case must have a summary in at least one language',
      });
    }

    /* The results and the scope lines. */
    const results = compileResults(slug, resultRows, errors, warnings);
    const scope = compileScope(slug, scopeRows, errors, warnings);
    const gallery = compileGallery(slug, galleryRows, errors, warnings);

    const clientLocal = {};
    const projectLocal = {};
    const partnershipSince = {};
    for (const locale of LOCALES) {
      clientLocal[locale] = localised[locale].clientLocal ?? '';
      projectLocal[locale] = localised[locale].projectLocal ?? '';
      partnershipSince[locale] = localised[locale].partnershipSince ?? '';
    }

    records.push(
      buildRecord({
        slug,
        order: 0,
        client: en.__values.client,
        clientLocal,
        projectLocal,
        sector,
        services: serviceKeys,
        partnershipSince: partnershipSince.en || partnershipSince['zh-Hant'] || partnershipSince['zh-Hans']
          ? partnershipSince
          : null,
        featured: featured === true,
        published: true,
        summary: Object.fromEntries(LOCALES.map((l) => [l, localised[l].summary ?? ''])),
        results,
        scope,
        gallery,
        source,
        image: imageFile
          ? {
              src: caseImagePath(slug, imageFile),
              alt: Object.fromEntries(
                LOCALES.map((l) => [
                  l,
                  applyMockUpPrefix(localised[l].imageAlt ?? '', l, mockup === true),
                ]),
              ),
              mockup: mockup === true,
            }
          : null,
      }),
    );
  }

  /* The order is the position among the *published* cases, so a draft in
     the middle of the sheet does not leave a hole in the sequence. */
  records.forEach((record, index) => {
    record.order = index;
  });

  return { records, errors, warnings };
}

/**
 * The results of one case.
 *
 * A result is lined up across the three languages by its `order` column,
 * not by its position — so a language that is one result behind is not a
 * failure, it is a translation in progress. The site falls back to English
 * for a label that has not been translated yet, which is what it does
 * everywhere else.
 *
 * The figure is not localised, so if two languages disagree about it the
 * English one is used and the difference is reported. Neither stops the
 * site from publishing: a half-translated case is a normal state to be in,
 * and freezing the site over it is worse than the half-translation.
 */
function compileResults(slug, resultRows, errors, warnings) {
  const perLocale = {};

  for (const locale of LOCALES) {
    const rows = resultRows[locale].filter((r) => r.__values.slug === slug);
    rows.sort((a, b) => Number(a.__values.order || 0) - Number(b.__values.order || 0));
    perLocale[locale] = rows;
  }

  /* The orders, and the union of them. */
  const orders = new Map();
  for (const locale of LOCALES) {
    for (const row of perLocale[locale]) {
      const order = Number(row.__values.order || 0);
      if (!order) continue;
      if (!orders.has(order)) orders.set(order, {});
      orders.get(order)[locale] = row.__values;
    }
  }

  const counts = LOCALES.map((l) => perLocale[l].length);
  if (new Set(counts).size > 1) {
    warnings.push({
      tab: 'the results tabs',
      slug,
      message: `the case has a different number of results in each language (${LOCALES.map(
        (l, i) => `${l}: ${counts[i]}`,
      ).join(', ')}) — each language shows the ones it has`,
    });
  }

  const out = [];

  for (const order of [...orders.keys()].sort((a, b) => a - b)) {
    const rows = orders.get(order);
    const value = (rows.en ?? rows['zh-Hant'] ?? rows['zh-Hans'] ?? {}).value ?? '';
    const label = {};
    const note = {};

    for (const locale of LOCALES) {
      const row = rows[locale];
      label[locale] = row?.label ?? '';
      note[locale] = row?.note ?? '';
    }

    if (!value) {
      warnings.push({
        tab: 'the results tabs',
        slug,
        column: 'value',
        message: `result ${order} has no figure`,
      });
    }

    for (const locale of LOCALES) {
      if (label[locale]) continue;
      warnings.push({
        tab: RESULT_TABS[locale],
        slug,
        column: 'label',
        message: `result ${order} has no label in ${locale} — it shows in English there`,
      });
    }

    out.push({
      value,
      label,
      note: Object.values(note).some((n) => n) ? note : null,
    });
  }

  return out;
}

/** The scope lines of one case, checked across the three locales. */
/**
 * The scope lines of one case.
 *
 * Lined up by `order`, like the results. A language that is a line behind is
 * a translation in progress, not a failure.
 */
function compileScope(slug, scopeRows, errors, warnings) {
  const perLocale = {};

  for (const locale of LOCALES) {
    const rows = scopeRows[locale].filter((r) => r.__values.slug === slug);
    rows.sort((a, b) => Number(a.__values.order || 0) - Number(b.__values.order || 0));
    perLocale[locale] = rows;
  }

  const orders = new Map();
  for (const locale of LOCALES) {
    for (const row of perLocale[locale]) {
      const order = Number(row.__values.order || 0);
      if (!order) continue;
      if (!orders.has(order)) orders.set(order, {});
      orders.get(order)[locale] = row.__values;
    }
  }

  const counts = LOCALES.map((l) => perLocale[l].length);
  if (new Set(counts).size > 1) {
    warnings.push({
      tab: 'the scope tabs',
      slug,
      message: `the case has a different number of scope lines in each language (${LOCALES.map(
        (l, i) => `${l}: ${counts[i]}`,
      ).join(', ')}) — each language shows the ones it has`,
    });
  }

  const out = [];

  for (const order of [...orders.keys()].sort((a, b) => a - b)) {
    const rows = orders.get(order);
    const text = {};

    for (const locale of LOCALES) {
      text[locale] = rows[locale]?.text ?? '';
      if (text[locale]) continue;
      warnings.push({
        tab: SCOPE_TABS[locale],
        slug,
        column: 'text',
        message: `scope line ${order} is empty in ${locale} — it shows in English there`,
      });
    }
    out.push(text);
  }

  return out;
}

/**
 * The frames of one case.
 *
 * Lined up by `order`, like the results and the scope lines. The file name
 * and the mock-up flag belong to the picture, so they are the same in every
 * language — the English one is used, and a difference is reported. The alt
 * text and the caption are copy: a language that has not translated them yet
 * falls back to English, which is what the site does everywhere else.
 *
 * A frame whose file is empty is a frame whose picture has not arrived yet.
 * It is left out of the page rather than published as a broken image.
 */
function compileGallery(slug, galleryRows, errors, warnings) {
  const perLocale = {};
  for (const locale of LOCALES) {
    const rows = galleryRows[locale].filter((r) => r.__values.slug === slug);
    rows.sort((a, b) => Number(a.__values.order || 0) - Number(b.__values.order || 0));
    perLocale[locale] = rows;
  }

  const orders = new Map();
  for (const locale of LOCALES) {
    for (const row of perLocale[locale]) {
      const order = Number(row.__values.order || 0);
      if (!order) continue;
      if (!orders.has(order)) orders.set(order, {});
      orders.get(order)[locale] = row.__values;
    }
  }

  const sorted = [...orders.keys()].sort((a, b) => a - b);

  if (sorted.length > GALLERY_MAX_FRAMES) {
    errors.push({
      tab: 'the gallery tabs',
      slug,
      column: 'order',
      message: `the case has ${sorted.length} frames — a case page carries at most ${GALLERY_MAX_FRAMES}`,
    });
  }

  const out = [];

  for (const order of sorted) {
    const rows = orders.get(order);

    /* The file is the picture, and the picture is the same in every
       language. */
    const file = (rows.en ?? rows['zh-Hant'] ?? rows['zh-Hans'] ?? {}).file ?? '';
    for (const locale of LOCALES) {
      const other = rows[locale]?.file ?? '';
      if (!other || other === file) continue;
      warnings.push({
        tab: GALLERY_TABS[locale],
        slug,
        column: 'file',
        message: `frame ${order} names a different file in ${locale} ("${other}") — the English one is used`,
      });
    }

    /* A frame with no file has no picture yet. It is not shown, and it is
       not an error — the editor may still be uploading it. */
    if (!file) {
      warnings.push({
        tab: 'the gallery tabs',
        slug,
        message: `frame ${order} has no picture yet — it is not shown until the file is there`,
      });
      continue;
    }

    const mockupRaw = (rows.en ?? rows['zh-Hant'] ?? rows['zh-Hans'] ?? {}).mockup ?? '';
    const mockup = parseBoolean(mockupRaw);
    if (mockup === null) {
      warnings.push({
        tab: 'the gallery tabs',
        slug,
        column: 'mockup',
        message: `frame ${order} has no mock-up flag — it is read as false`,
      });
    }
    for (const locale of LOCALES) {
      const other = parseBoolean(rows[locale]?.mockup ?? '');
      if (other === null || other === mockup) continue;
      warnings.push({
        tab: GALLERY_TABS[locale],
        slug,
        column: 'mockup',
        message: `frame ${order} is a mock-up in one language and not in another — the English flag is used`,
      });
    }

    /* The alt text falls back to English, and the mock-up prefix is put on
       afterwards, so a language that has not translated it yet still says
       "mock-up" rather than nothing at all. */
    const englishAlt = stripMockUpPrefix(rows.en?.alt ?? '', 'en');
    const englishCaption = rows.en?.caption ?? '';

    const alt = {};
    const caption = {};

    for (const locale of LOCALES) {
      const row = rows[locale];
      const own = stripMockUpPrefix(row?.alt ?? '', locale);
      alt[locale] = applyMockUpPrefix(own || englishAlt, locale, mockup === true);
      caption[locale] = row?.caption || englishCaption;

      if (!row?.alt) {
        warnings.push({
          tab: GALLERY_TABS[locale],
          slug,
          column: 'alt',
          message: `frame ${order} has no alt text in ${locale} — it shows in English there`,
        });
      }
    }

    out.push({
      src: caseImagePath(slug, file),
      alt,
      caption,
      mockup: mockup === true,
    });
  }

  return out;
}

/** Format an error for the console. */
export function formatError(error) {
  const where = [error.tab, error.row ? `row ${error.row}` : null, error.slug]
    .filter(Boolean)
    .join(' · ');
  const column = error.column ? ` [${error.column}]` : '';
  return `  ${where}${column}\n      ${error.message}`;
}
