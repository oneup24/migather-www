/**
 * Migather — the works-page editor.
 *
 * A Google Apps Script web app. The editor opens it, picks a case, edits one
 * language of it, and saves. The sheet holds the fields, the Drive folder
 * holds the image, and the script ties the two together and asks GitHub to
 * publish.
 *
 * ── Why it is shaped this way ────────────────────────────────────────────
 *
 * · One locale per session. The form edits one language at a time, so
 *   zh-Hant and zh-Hans can never be filled by copying each other, and a
 *   missing translation is visible as "2 of 3 languages ready" rather than
 *   as a blank field.
 *
 * · The GitHub token lives in the script's properties, never in the
 *   repository and never in the browser. The browser posts to the script;
 *   the script talks to GitHub.
 *
 * · The sheet is the storage, not a second editor. Editing the sheet
 *   directly is possible, but the supported path is this form.
 *
 * ── Setting it up ───────────────────────────────────────────────────────
 *
 * 1. Create the sheet and the Drive folder (see docs/CMS.md).
 * 2. Share both with the service account named in the sheet's settings tab.
 * 3. In this project, set the script properties:
 *      SPREADSHEET_ID   the sheet id
 *      DRIVE_FOLDER_ID  the Drive folder id
 *      GITHUB_TOKEN     a token with `repo` scope, or a fine-grained token
 *                       with write access to this repository
 *      GITHUB_OWNER     the repository owner
 *      GITHUB_REPO      the repository name
 * 4. Put the editor email addresses in the sheet's `settings` tab, on the
 *    `editors` row, separated by commas.
 * 5. Deploy as a web app, executing as you, with access "Anyone with a
 *    Google account". The allow-list below is what actually decides who may
 *    edit.
 *
 * This file is plain Apps Script — it is not part of the site build, and it
 * is deployed from this folder by copy and paste, not by the repository.
 */

/** The tabs the form reads and writes. */
var CASE_TABS = {
  en: 'cases_EN',
  'zh-Hant': 'cases_ZH-HANT',
  'zh-Hans': 'cases_ZH-HANS',
};
var RESULT_TABS = {
  en: 'results_EN',
  'zh-Hant': 'results_ZH-HANT',
  'zh-Hans': 'results_ZH-HANS',
};
var SCOPE_TABS = {
  en: 'scope_EN',
  'zh-Hant': 'scope_ZH-HANT',
  'zh-Hans': 'scope_ZH-HANS',
};

var LOCALES = ['en', 'zh-Hant', 'zh-Hans'];
var SETTINGS_TAB = 'settings';

/** The columns of the cases tab, in the order the sheet holds them. */
var CASE_COLUMNS = [
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

var RESULT_COLUMNS = ['slug', 'order', 'value', 'label', 'note'];
var SCOPE_COLUMNS = ['slug', 'order', 'text'];

/** The sectors a case may carry — the same keys as `sectors` in the site. */
var SECTORS = ['finance', 'properties', 'travel', 'luxury', 'lifestyle'];

/**
 * The vocabulary the form offers.
 *
 * The seed writes the sector keys and the service keys into the settings
 * tab, from the site's own taxonomy, so the form cannot offer a service or
 * a sector the site does not have. If the settings tab has no vocabulary
 * yet, the fallback lists are used.
 */
function vocabulary_() {
  var settings = settings_();
  var sectors = parseList_(settings.sectors, SECTORS);
  var services = parseList_(settings.services, []);
  return { sectors: sectors, services: services };
}

/** A JSON list from the settings tab, or a fallback. */
function parseList_(raw, fallback) {
  if (!raw) return fallback;
  try {
    var parsed = JSON.parse(raw);
    if (Object.prototype.toString.call(parsed) !== '[object Array]') return fallback;
    return parsed;
  } catch (error) {
    return fallback;
  }
}

/* ── The sheet ──────────────────────────────────────────────────────────── */

/** The spreadsheet, opened by id. */
function sheet_() {
  return SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));
}

/** A script property, with a clear error when it has not been set. */
function scriptProperty_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error('the script property ' + name + ' has not been set');
  }
  return value;
}

/** The Drive folder the images live in. */
function driveFolder_() {
  return DriveApp.getFolderById(scriptProperty_('DRIVE_FOLDER_ID'));
}

/** A tab, by name. */
function tab_(name) {
  return sheet_().getSheetByName(name);
}

/** The values of a tab, as rows of strings. The first row is the header. */
function readTab_(name) {
  var sheet = tab_(name);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  return values.map(function (row) {
    return row.map(function (cell) {
      return cell === null || cell === undefined ? '' : String(cell).trim();
    });
  });
}

/** The header row of a tab. */
function header_(name) {
  var values = readTab_(name);
  return values.length ? values[0] : [];
}

/** Write a block of rows, overwriting what is there. */
function writeTab_(name, rows) {
  var sheet = tab_(name);
  if (!sheet) throw new Error('the tab ' + name + ' does not exist');
  sheet.clearContents();
  if (rows.length) {
    sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

/** Append rows to the end of a tab. */
function appendTab_(name, rows) {
  if (!rows.length) return;
  var sheet = tab_(name);
  if (!sheet) throw new Error('the tab ' + name + ' does not exist');
  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);
}

/** The index of a column in a header row, or -1. */
function columnIndex_(header, column) {
  return header.indexOf(column);
}

/* ── The settings ──────────────────────────────────────────────────────── */

/** The settings tab, as a map. */
function settings_() {
  var values = readTab_(SETTINGS_TAB);
  var out = {};
  for (var i = 1; i < values.length; i += 1) {
    if (!values[i][0]) continue;
    out[values[i][0]] = values[i][1] || '';
  }
  return out;
}

/** The emails allowed to edit, from the `editors` row of the settings tab. */
function allowedEditors_() {
  var raw = settings_().editors || '';
  return raw
    .split(',')
    .map(function (email) {
      return email.trim().toLowerCase();
    })
    .filter(Boolean);
}

/** The signed-in editor, or null. */
function activeUser_() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (error) {
    return null;
  }
}

/** Refuse anyone who is not on the allow-list. */
function requireEditor_() {
  var email = activeUser_();
  if (!email) {
    throw new Error(
      'the form could not tell who you are. Deploy the web app with access set to "Anyone with a Google account", and sign in with an account on the allow-list.',
    );
  }
  if (allowedEditors_().indexOf(email.toLowerCase()) === -1) {
    throw new Error(email + ' is not on the editor allow-list in the settings tab.');
  }
  return email;
}

/* ── The cases ─────────────────────────────────────────────────────────── */

/** Every case in the sheet, keyed by slug, with the rows of each tab. */
function allCases_() {
  var cases = {};
  LOCALES.forEach(function (locale) {
    var tab = CASE_TABS[locale];
    var header = header_(tab);
    if (!header.length) return;
    var slugIndex = columnIndex_(header, 'slug');
    if (slugIndex === -1) return;

    readTab_(tab).slice(1).forEach(function (row) {
      var slug = row[slugIndex];
      if (!slug) return;
      if (!cases[slug]) {
        cases[slug] = {
          slug: slug,
          rows: {},
          values: {},
        };
      }
      cases[slug].rows[locale] = row;
      cases[slug].values[locale] = rowToObject_(header, row);
    });
  });

  /* The results and the scope lines, per locale. */
  LOCALES.forEach(function (locale) {
    var header = header_(RESULT_TABS[locale]);
    var slugIndex = columnIndex_(header, 'slug');
    if (slugIndex === -1) return;
    readTab_(RESULT_TABS[locale]).slice(1).forEach(function (row) {
      var slug = row[slugIndex];
      if (!slug || !cases[slug]) return;
      cases[slug].results = cases[slug].results || {};
      cases[slug].results[locale] = cases[slug].results[locale] || [];
      cases[slug].results[locale].push({ row: row, values: rowToObject_(header, row) });
    });

    var scopeHeader = header_(SCOPE_TABS[locale]);
    var scopeSlugIndex = columnIndex_(scopeHeader, 'slug');
    if (scopeSlugIndex === -1) return;
    readTab_(SCOPE_TABS[locale]).slice(1).forEach(function (row) {
      var slug = row[scopeSlugIndex];
      if (!slug || !cases[slug]) return;
      cases[slug].scope = cases[slug].scope || {};
      cases[slug].scope[locale] = cases[slug].scope[locale] || [];
      cases[slug].scope[locale].push({ row: row, values: rowToObject_(scopeHeader, row) });
    });
  });

  return cases;
}

/** A row as an object keyed by the header. */
function rowToObject_(header, row) {
  var out = {};
  header.forEach(function (column, index) {
    out[column] = row[index] === undefined ? '' : row[index];
  });
  return out;
}

/** How many of the three languages of a case are complete. */
function readiness_(entry) {
  var ready = LOCALES.filter(function (locale) {
    var values = entry.values[locale];
    if (!values) return false;
    return Boolean(values.summary && values.client && values.imageAlt);
  });
  return { ready: ready.length, total: LOCALES.length, locales: ready };
}

/* ── The web app ───────────────────────────────────────────────────────── */

/** The form. */
function doGet() {
  var email = activeUser_();
  var allowed = allowedEditors_();
  var permitted = email && allowed.indexOf(email.toLowerCase()) !== -1;

  var template = HtmlService.createTemplateFromFile('Index');
  template.cases = caseList_();
  var vocabulary = vocabulary_();
  template.vocabulary = vocabulary;
  template.sectors = vocabulary.sectors;
  template.services = vocabulary.services;
  template.allowedEditors = allowed.length;
  template.signedInAs = email || '(not signed in)';
  template.permitted = permitted;

  if (!permitted) {
    // The allow-list itself is not echoed back. Anyone who opens the form
    // learns who they are and that they cannot edit — not who else can.
    template.message =
      'You are signed in as ' +
      template.signedInAs +
      '. That account is not on the editor allow-list, so nothing here can be changed.';
  } else {
    template.message = '';
  }

  return template.evaluate().setTitle('Migather — works editor');
}

/** The list of cases, for the picker. */
function caseList_() {
  var cases = allCases_();
  return Object.keys(cases)
    .sort()
    .map(function (slug) {
      var entry = cases[slug];
      var values = entry.values.en || entry.values['zh-Hant'] || entry.values['zh-Hans'] || {};
      var readiness = readiness_(entry);
      return {
        slug: slug,
        client: values.client || slug,
        ready: readiness.ready,
        total: readiness.total,
        published: values.published === 'true',
      };
    });
}

/** The write path. `save` stores the case; `publish` stores it and asks
 *  GitHub to rebuild the site. */
function doPost(request) {
  var action = (request.parameter('action') || 'save').toLowerCase();
  var payload = request.parameter('payload') || '{}';
  return api(action, payload);
}

/**
 * The client-facing entry point.
 *
 * The form calls this through `google.script.run`, so it takes its arguments
 * as plain values rather than as a request event. It answers with JSON in
 * the shape `{ ok: true, … }` or `{ ok: false, error: "…" }`, and it never
 * throws at the form: a failure is a message the editor can act on.
 */
function api(action, payloadJson) {
  try {
    requireEditor_();

    var verb = String(action || '').toLowerCase();
    var payload = payloadJson ? JSON.parse(payloadJson) : {};

    if (verb === 'load') {
      return json_({ ok: true, case: load_(payload.slug, payload.locale) });
    }

    if (verb === 'save' || verb === 'publish') {
      return json_({ ok: true, result: save_(payload, verb === 'publish') });
    }

    return json_({ ok: false, error: 'unknown action "' + action + '"' });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

/** The JSON reply. */
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** One case, for the form. */
function load_(slug, locale) {
  var cases = allCases_();
  var entry = cases[slug];
  if (!entry) throw new Error('there is no case called ' + slug);

  var values = entry.values[locale] || entry.values.en || {};
  var results = (entry.results && entry.results[locale]) || [];
  var scope = (entry.scope && entry.scope[locale]) || [];

  return {
    slug: slug,
    locale: locale,
    values: values,
    results: results.map(function (r) {
      return r.values;
    }),
    scope: scope.map(function (s) {
      return s.values;
    }),
    readiness: readiness_(entry),
    published: values.published === 'true',
  };
}

/**
 * Save a case.
 *
 * The locale-dependent fields are written into that locale's tab only. The
 * locale-independent ones — slug, client, sector, services, source, image,
 * mockup, featured, published — are written into all three tabs, because the
 * sync fails the build if they disagree, and the editor should not be able
 * to make them disagree by accident.
 *
 * `publish` sets published to true on every tab, but only when all three
 * languages are complete. A case that is not ready stays a draft.
 */
function save_(payload, publish) {
  var slug = String(payload.slug || '').trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('the slug "' + slug + '" is not a valid route id');
  }

  var locale = payload.locale;
  if (LOCALES.indexOf(locale) === -1) {
    throw new Error('unknown locale "' + locale + '"');
  }

  var cases = allCases_();
  var existing = cases[slug];
  var values = (existing && existing.values[locale]) || {};

  /* The row as it will be written. */
  var next = {};
  CASE_COLUMNS.forEach(function (column) {
    next[column] = values[column] === undefined ? '' : values[column];
  });

  /* The slug is the row's own identity, and a new case has no row yet to
     read it from. */
  next.slug = slug;

  var shared = [
    'client',
    'sector',
    'services',
    'source',
    'image',
    'mockup',
    'featured',
  ];
  var localised = [
    'clientLocal',
    'projectLocal',
    'partnershipSince',
    'summary',
    'imageAlt',
  ];

  localised.forEach(function (column) {
    next[column] = payload[column] === undefined ? next[column] : String(payload[column]);
  });
  shared.forEach(function (column) {
    next[column] = payload[column] === undefined ? next[column] : String(payload[column]);
  });

  if (payload.mockup !== undefined) next.mockup = payload.mockup ? 'true' : 'false';
  if (payload.featured !== undefined) next.featured = payload.featured ? 'true' : 'false';

  /* The image. */
  var imageName = next.image;
  if (payload.imageData && payload.imageName) {
    imageName = saveImage_(slug, payload.imageName, payload.imageData);
    next.image = imageName;
  }

  /* The publish state. */
  var published = next.published === 'true';
  if (publish) published = true;

  /* Is the case ready in all three languages? */
  var readiness = readinessAfter_(cases, slug, locale, next);
  if (publish && readiness.ready < readiness.total) {
    published = false;
  }
  next.published = published ? 'true' : 'false';

  writeCaseRow_(slug, locale, next, cases);
  writeResults_(slug, locale, payload.results || []);
  writeScope_(slug, locale, payload.scope || []);

  /* The locale-independent fields have to read the same in all three tabs,
     because the sync refuses to compile a case whose tabs disagree. So they
     are written into all three — and where the case does not exist yet, a
     row is created. That is how a new case starts: three rows, one language
     filled in, the other two still empty, and the case stays a draft until
     all three are ready. */
  LOCALES.forEach(function (other) {
    if (other === locale) return;
    var entry = cases[slug];
    var otherValues = {};
    CASE_COLUMNS.forEach(function (column) {
      otherValues[column] =
        entry && entry.values[other] ? entry.values[other][column] : '';
    });
    otherValues.slug = slug;
    shared.forEach(function (column) {
      otherValues[column] = next[column];
    });
    otherValues.image = next.image;
    otherValues.published = next.published;
    writeCaseRow_(slug, other, otherValues, cases);
  });

  var triggered = false;
  if (publish && published) {
    triggerPublish_();
    triggered = true;
  }

  return {
    slug: slug,
    published: published,
    readiness: readiness,
    publishedNow: triggered,
    message: triggered
      ? 'Saved and published. The site rebuilds in a couple of minutes.'
      : 'Saved as a draft. ' +
        readiness.ready +
        ' of ' +
        readiness.total +
        ' languages are ready.',
  };
}

/** How many languages will be ready after this save. */
function readinessAfter_(cases, slug, locale, next) {
  var ready = 0;
  LOCALES.forEach(function (each) {
    var values;
    if (each === locale) {
      values = next;
    } else {
      var entry = cases[slug];
      values = entry && entry.values[each];
    }
    if (values && values.summary && values.client && values.imageAlt) ready += 1;
  });
  return { ready: ready, total: LOCALES.length };
}

/** Write one case row into one locale tab. */
function writeCaseRow_(slug, locale, values, cases) {
  var tab = CASE_TABS[locale];
  var header = header_(tab);
  if (!header.length) {
    writeTab_(tab, [CASE_COLUMNS]);
    header = CASE_COLUMNS;
  }

  var rows = readTab_(tab);
  var slugIndex = columnIndex_(header, 'slug');

  var row = header.map(function (column) {
    return values[column] === undefined ? '' : values[column];
  });

  var found = -1;
  for (var i = 1; i < rows.length; i += 1) {
    if (rows[i][slugIndex] === slug) {
      found = i;
      break;
    }
  }

  if (found === -1) {
    appendTab_(tab, [row]);
    return;
  }

  var sheet = tab_(tab);
  sheet.getRange(found + 1, 1, 1, row.length).setValues([row]);
}

/** Write the results of a case into one locale tab. */
function writeResults_(slug, locale, results) {
  var tab = RESULT_TABS[locale];
  var header = header_(tab);
  if (!header.length) {
    writeTab_(tab, [RESULT_COLUMNS]);
    header = RESULT_COLUMNS;
  }

  var rows = readTab_(tab);
  var slugIndex = columnIndex_(header, 'slug');
  var kept = rows.filter(function (row, index) {
    return index === 0 || row[slugIndex] !== slug;
  });

  var block = results.map(function (result, index) {
    var row = {};
    RESULT_COLUMNS.forEach(function (column) {
      row[column] = result[column] === undefined ? '' : result[column];
    });
    row.slug = slug;
    row.order = String(index + 1);
    return header.map(function (column) {
      return row[column] === undefined ? '' : row[column];
    });
  });

  writeTab_(tab, kept.concat(block));
}

/** Write the scope lines of a case into one locale tab. */
function writeScope_(slug, locale, scope) {
  var tab = SCOPE_TABS[locale];
  var header = header_(tab);
  if (!header.length) {
    writeTab_(tab, [SCOPE_COLUMNS]);
    header = SCOPE_COLUMNS;
  }

  var rows = readTab_(tab);
  var slugIndex = columnIndex_(header, 'slug');
  var kept = rows.filter(function (row, index) {
    return index === 0 || row[slugIndex] !== slug;
  });

  var block = scope.map(function (line, index) {
    var row = {};
    SCOPE_COLUMNS.forEach(function (column) {
      row[column] = line[column] === undefined ? '' : line[column];
    });
    row.slug = slug;
    row.order = String(index + 1);
    return header.map(function (column) {
      return row[column] === undefined ? '' : row[column];
    });
  });

  writeTab_(tab, kept.concat(block));
}

/**
 * Save an uploaded image into the case's Drive folder.
 *
 * The image arrives as base64. The folder is named after the slug, so the
 * sync can find it without a lookup table.
 */
function saveImage_(slug, fileName, dataUrl) {
  var folder = driveFolder_();
  var folders = folder.getFoldersByName(slug);
  var target = folders.hasNext() ? folders.next() : folder.createFolder(slug);

  var match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) throw new Error('the image was not sent as a base64 image');

  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, match[1], fileName);

  var existing = target.getFilesByName(fileName);
  if (existing.hasNext()) {
    var old = existing.next();
    old.setContent(blob.getBytes());
    return fileName;
  }

  target.createFile(blob);
  return fileName;
}

/**
 * Ask GitHub to rebuild the site.
 *
 * The token is a script property. It never reaches the browser.
 */
function triggerPublish_() {
  var owner = setting_('GITHUB_OWNER');
  var repo = setting_('GITHUB_REPO');
  var token = scriptProperty_('GITHUB_TOKEN');

  var response = UrlFetchApp.fetch(
    'https://api.github.com/repos/' + owner + '/' + repo + '/dispatches',
    {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'migather-cms',
      },
      payload: JSON.stringify({ event_type: 'sync-cases' }),
      muteHttpExceptions: true,
    },
  );

  if (response.getResponseCode() !== 204) {
    throw new Error(
      'GitHub refused the publish (' + response.getResponseCode() + '): ' + response.getContentText(),
    );
  }
}

/** The settings tab's owner and repository, falling back to the properties. */
function setting_(name) {
  var fromSheet = settings_()[name];
  if (fromSheet) return fromSheet;
  return scriptProperty_(name);
}
