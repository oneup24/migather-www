/**
 * Migather — the works editor's helper.
 *
 * This is not the editor any more. The editor is a page of the website,
 * at `/admin`, where an editor signs in with their own Google account and
 * fills in the form. The sheet is written directly by that page, as the
 * person doing the editing.
 *
 * So this script has only the two jobs the browser cannot do for itself:
 *
 *   1. Save a picture to the Drive folder. A service account has no
 *      storage quota, and a browser cannot write to Drive without a Drive
 *      scope on the editor's account — so the picture is posted here
 *      instead. This script runs as the editor, and the editor has quota.
 *
 *   2. Ask GitHub to rebuild the site. The token lives in the script
 *      properties, never in the repository and never in a browser.
 *
 * ── Setting it up ───────────────────────────────────────────────────────
 *
 * Set the script properties:
 *
 *   DRIVE_FOLDER_ID   the Drive folder the case images live in
 *   GITHUB_TOKEN      a token with write access to the repository
 *   GITHUB_OWNER      the repository owner
 *   GITHUB_REPO       the repository name
 *
 * The repository coordinates may also be set on the `settings` tab of the
 * sheet, on the `github_owner` and `github_repo` rows, which take
 * precedence.
 *
 * Deploy as a web app, executing as you, with access "Anyone with a Google
 * account" — the browser posts here from a hidden iframe, which makes it a
 * first-party request for script.google.com and therefore carries the
 * editor's Google session.
 */

/** The Drive folder the case images live in. */
function driveFolder_() {
  return DriveApp.getFolderById(setting_('DRIVE_FOLDER_ID'));
}

/** A script property, with a clear error when it has not been set. */
function scriptProperty_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) {
    throw new Error('the script property ' + name + ' has not been set');
  }
  return value;
}

/**
 * A setting.
 *
 * The sheet wins over the script properties, so the repository
 * coordinates can be changed in the sheet without redeploying.
 */
function setting_(name) {
  try {
    var fromSheet = settings_()[name];
    if (fromSheet) return fromSheet;
  } catch (error) {
    /* The sheet is not readable from here. Fall through to the property. */
  }
  return scriptProperty_(name);
}

/** The settings tab, as a map. */
function settings_() {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));
  var tab = sheet.getSheetByName('settings');
  if (!tab) return {};

  var values = tab.getDataRange().getValues();
  var out = {};
  for (var i = 1; i < values.length; i += 1) {
    if (!values[i][0]) continue;
    out[String(values[i][0])] = String(values[i][1] || '');
  }
  return out;
}

/* ── The two jobs ─────────────────────────────────────────────────────── */

/**
 * Save a picture into the case's folder.
 *
 * The folder is named after the slug, so the sync finds the picture without
 * a lookup table. A file of the same name is replaced; a file of a
 * different name — the old picture, when the editor has uploaded a new one
 * under a new name — is deleted, so the folder does not fill up with
 * orphans.
 */
function saveImage_(slug, fileName, dataUrl) {
  var match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) throw new Error('the picture was not sent as a base64 image');

  var folder = driveFolder_();
  var folders = folder.getFoldersByName(slug);
  var target = folders.hasNext() ? folders.next() : folder.createFolder(slug);

  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, match[1], fileName);

  /* Clear out the old picture, whatever it was called. */
  var existing = target.getFiles();
  while (existing.hasNext()) {
    var old = existing.next();
    if (old.getName() !== fileName) old.setTrashed(true);
  }

  var same = target.getFilesByName(fileName);
  if (same.hasNext()) {
    same.next().setContent(bytes);
    return fileName;
  }

  target.createFile(blob);
  return fileName;
}

/**
 * Ask GitHub to rebuild the site.
 *
 * The token is a script property. It never reaches the browser.
 *
 * The dispatch is only half the story: the browser cannot read a reply, so
 * it cannot know whether the run started, let alone whether it passed. So
 * this watches the run, and writes the outcome into the sheet's `settings`
 * tab — where the editor's page can read it and say what actually
 * happened.
 *
 * A request is only honoured if the sheet says it was asked for. The editor's
 * page writes `publishRequested` into the sheet before it posts here, and
 * only somebody who can write to the sheet can do that. So knowing this
 * script's address is not enough to make it rebuild the site — the sheet's
 * own sharing is the gate.
 */
function triggerPublish_() {
  var requested = settings_().publishRequested || '';
  var age = Date.now() - Date.parse(requested);
  if (!requested || isNaN(age) || age < 0 || age > 120000) {
    throw new Error(
      'the publish was not requested from the sheet — press Publish on the editor page',
    );
  }

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
      'GitHub refused the publish (' +
        response.getResponseCode() +
        '): ' +
        response.getContentText(),
    );
  }

  var stamp = new Date().toISOString();
  setSetting_('lastPublish', stamp);

  var outcome = watchRun_(owner, repo, token, stamp);
  setSetting_('lastPublishStatus', outcome.status);
  if (outcome.message) setSetting_('lastPublishMessage', outcome.message);

  return outcome;
}

/**
 * Watch the workflow run the dispatch started.
 *
 * Returns `{ status, message }`. A run that has not appeared within a
 * minute is treated as "not started" — the token may have gone stale, or
 * the workflow may have been disabled.
 */
function watchRun_(owner, repo, token, stamp) {
  var started = Date.parse(stamp);
  var deadline = Date.now() + 3 * 60 * 1000;

  while (Date.now() < deadline) {
    var runs = github_(
      token,
      'https://api.github.com/repos/' +
        owner +
        '/' +
        repo +
        '/actions/workflows/sync-cases.yml/runs?per_page=5',
    );

    if (runs && runs.workflow_runs) {
      for (var i = 0; i < runs.workflow_runs.length; i += 1) {
        var run = runs.workflow_runs[i];
        if (Date.parse(run.created_at) < started) continue;
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            return { status: 'ok', message: '' };
          }
          return {
            status: 'failed',
            message: 'the build failed (' + run.conclusion + ') — see the Actions tab',
          };
        }
        return { status: 'running', message: '' };
      }
    }

    Utilities.sleep(8000);
  }

  return {
    status: 'unknown',
    message: 'the build did not start — the GitHub token may have expired',
  };
}

/** A GET against the GitHub API. */
function github_(token, url) {
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'migather-cms',
    },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) return null;
  try {
    return JSON.parse(response.getContentText());
  } catch (error) {
    return null;
  }
}

/**
 * Write a row into the settings tab.
 *
 * The settings tab is the one place the editor's page and this script can
 * both read, so it is where an outcome is reported.
 */
function setSetting_(key, value) {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));
  var tab = sheet.getSheetByName('settings');
  if (!tab) return;

  var values = tab.getDataRange().getValues();
  for (var i = 1; i < values.length; i += 1) {
    if (String(values[i][0]) !== key) continue;
    tab.getRange(i + 1, 2).setValue(String(value));
    return;
  }

  tab.getRange(values.length + 1, 1, 1, 2).setValues([[key, String(value)]]);
}

/* ── The entry points ─────────────────────────────────────────────────── */

/**
 * The picture and the publish request.
 *
 * Both arrive as a form post from the editor's page, in a hidden iframe.
 * The browser cannot read the reply — Google sends no CORS headers — so
 * the answer lands in the frame and is not shown. The page says what
 * happened in its own words.
 */
function doPost(request) {
  try {
    /* The form's fields arrive in `request.parameter`, which is an object of
       key/value pairs — not a function to call. Reading it wrongly is what
       stopped the publish request from ever being read. */
    var params = (request && request.parameter) || {};
    var action = String(params.action || '').toLowerCase();

    if (action === 'image') {
      var slug = String(params.slug || '').trim();
      var fileName = String(params.fileName || '').trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error('the slug "' + slug + '" is not a valid route id');
      }
      if (!fileName || fileName.indexOf('/') !== -1) {
        throw new Error('the file name "' + fileName + '" is not valid');
      }
      saveImage_(slug, fileName, params.dataUrl || '');
      return reply_('The picture was saved.');
    }

    if (action === 'publish') {
      triggerPublish_();
      return reply_('The site is rebuilding.');
    }

    return reply_('unknown action "' + action + '"', true);
  } catch (error) {
    return reply_(error.message, true);
  }
}

/**
 * The answer.
 *
 * It goes into the iframe, where the browser cannot read it. It is still
 * worth writing: it shows in the Apps Script executions log, which is where
 * a failure is looked up.
 */
function reply_(message, isError) {
  return ContentService.createTextOutput(message).setMimeType(
    isError ? ContentService.MimeType.TEXT : ContentService.MimeType.TEXT,
  );
}

/**
 * Opening the script's address directly.
 *
 * A status page: whether the script is set up correctly, and which piece is
 * missing if it is not. It never prints a secret — only whether each
 * property is there and whether it works.
 *
 * This is the first thing to look at when a publish does not happen, and
 * it saves having to paste a token into a chat to find out whether it works.
 */
function doGet() {
  var checks = [];

  /* The sheet. */
  checks.push(checkSheet_());
  /* The Drive folder. */
  checks.push(checkDrive_());
  /* GitHub. */
  checks.push(checkGitHub_());

  var site = PropertiesService.getScriptProperties().getProperty('SITE_URL') || '';
  var link = site ? '<p><a href="' + site + '/en/admin">Open the works editor</a></p>' : '';

  var rows = checks
    .map(function (check) {
      var mark = check.ok ? '✓' : '✗';
      var colour = check.ok ? '#1d7a4c' : '#950534';
      return (
        '<tr><td style="padding:6px 12px 6px 0;color:' +
        colour +
        ';font-weight:600">' +
        mark +
        '</td><td style="padding:6px 0"><strong>' +
        check.name +
        '</strong> — ' +
        check.detail +
        '</td></tr>'
      );
    })
    .join('');

  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta charset="utf-8"><title>Migather — editor status</title>' +
      '<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:46rem;margin:3rem auto;padding:0 1.5rem;color:#1c1c1c}' +
      'table{border-collapse:collapse;width:100%;margin:1.5rem 0;font-size:14px}' +
      'h1{font-size:1.3rem;margin:0 0 .3rem}p{margin:.4rem 0;color:#555}</style></head><body>' +
      '<h1>The works editor — status</h1>' +
      '<p>Whether the script can save a picture and ask the site to rebuild. ' +
      'No secret is printed here.</p>' +
      '<table>' +
      rows +
      '</table>' +
      link +
      '</body></html>',
  ).setTitle('Migather — editor status');
}

/** Is the sheet there, and can this script read it? */
function checkSheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    return { name: 'The sheet', ok: false, detail: 'the script property SPREADSHEET_ID is not set' };
  }
  try {
    var sheet = SpreadsheetApp.openById(id);
    var tabs = sheet.getSheets().length;
    return {
      name: 'The sheet',
      ok: true,
      detail: 'readable — ' + tabs + ' tab(s)',
    };
  } catch (error) {
    return {
      name: 'The sheet',
      ok: false,
      detail: 'cannot read it — ' + error.message,
    };
  }
}

/** Is the Drive folder there, and can this script see it? */
function checkDrive_() {
  var id = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!id) {
    return {
      name: 'The picture folder',
      ok: false,
      detail: 'the script property DRIVE_FOLDER_ID is not set',
    };
  }
  try {
    var folder = DriveApp.getFolderById(id);
    var count = folder.getFolders().length;
    return {
      name: 'The picture folder',
      ok: true,
      detail: 'readable — ' + count + ' case folder(s)',
    };
  } catch (error) {
    return {
      name: 'The picture folder',
      ok: false,
      detail: 'cannot read it — ' + error.message,
    };
  }
}

/** Is the GitHub token there, and does it work? */
function checkGitHub_() {
  var properties = PropertiesService.getScriptProperties();
  var token = properties.getProperty('GITHUB_TOKEN');
  var owner = properties.getProperty('GITHUB_OWNER');
  var repo = properties.getProperty('GITHUB_REPO');

  if (!token) {
    return {
      name: 'GitHub',
      ok: false,
      detail: 'the script property GITHUB_TOKEN is not set',
    };
  }
  if (!owner || !repo) {
    return {
      name: 'GitHub',
      ok: false,
      detail: 'GITHUB_OWNER or GITHUB_REPO is not set',
    };
  }

  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + owner + '/' + repo, {
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'migather-cms',
    },
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  var scopes = response.getHeaders()['X-OAuth-Scopes'] || '';

  if (code === 200) {
    return {
      name: 'GitHub',
      ok: true,
      detail:
        'the token works, and ' +
        owner +
        '/' +
        repo +
        ' is reachable' +
        (scopes ? ' — scopes: ' + scopes : ''),
    };
  }

  if (code === 401) {
    return {
      name: 'GitHub',
      ok: false,
      detail:
        'the token was refused (401) — it is not a valid token. Check it for a stray ' +
        'space or a missing character, and make a new one if it has expired',
    };
  }

  if (code === 403) {
    return {
      name: 'GitHub',
      ok: false,
      detail:
        'the token is valid but not allowed to write here (403)' +
        (scopes ? ' — it has: ' + scopes : ''),
    };
  }

  return {
    name: 'GitHub',
    ok: false,
    detail: 'the token was refused (' + code + ')',
  };
}
