/**
 * Migather — the works editor's helper.
 *
 * This is not the editor any more. The editor is a page of the website,
 * at `/admin`, where an editor signs in with their own Google account and
 * fills in the form. The sheet is written directly by that page, as the
 * person doing the editing.
 *
 * So this script has only the jobs the browser cannot do for itself:
 *
 *   1. Save a picture to the Drive folder. A service account has no
 *      storage quota, and a browser cannot write to Drive without a Drive
 *      scope on the editor's account — so the picture is posted here
 *      instead. This script runs as the editor, and the editor has quota.
 *
 *   2. Save a frame — the second picture of a case — the same way, into the
 *      same folder. The frame's file is named after the page and the alt
 *      text the editor typed, and its name and its mock-up flag go into
 *      the sheet together, once the file is really there.
 *
 *   3. Ask GitHub to rebuild the site. The token lives in the script
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
 *
 * ── Reading the form ─────────────────────────────────────────────────────
 *
 * The event object carries the form's fields in `request.parameter`, which is
 * an object of key/value pairs. It is not a method: `request.parameter('action')`
 * throws, and because the read sits on the first line of `doPost` the publish
 * request dies before anything is answered. Read `request.parameter.action`.
 */

/** The tabs the cases live in, one per language. */
var CASE_TABS = {
  en: 'cases_EN',
  'zh-Hant': 'cases_ZH-HANT',
  'zh-Hans': 'cases_ZH-HANS',
};

/**
 * The tabs the frames live in, one per language.
 *
 * A frame is a second picture for the case, and it lives in the same Drive
 * folder as the banner — which is why the folder's clean-up rule below has
 * to know about them.
 */
var GALLERY_TABS = {
  en: 'gallery_EN',
  'zh-Hant': 'gallery_ZH-HANT',
  'zh-Hans': 'gallery_ZH-HANS',
};

/** The columns of a gallery tab. */
var GALLERY_COLUMNS = ['slug', 'order', 'file', 'alt', 'caption', 'mockup'];

/** How many frames a case may carry. */
var GALLERY_MAX_FRAMES = 12;

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
 *
 * The frames live in the same folder, and they are left alone: a file the
 * sheet names as a frame is a frame, whatever the banner is called.
 */
function saveImage_(slug, fileName, dataUrl, isMockup) {
  var match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) throw new Error('the picture was not sent as a base64 image');

  var folder = driveFolder_();
  var folders = folder.getFoldersByName(slug);
  var target = folders.hasNext() ? folders.next() : folder.createFolder(slug);

  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, match[1], fileName);

  /* Clear out the old picture, whatever it was called — but not the frames,
     which the sheet names and which live here too. */
  var frames = galleryFileNames_(slug);
  var existing = target.getFiles();
  while (existing.hasNext()) {
    var old = existing.next();
    if (old.getName() === fileName) continue;
    if (frames.indexOf(old.getName()) !== -1) continue;
    old.setTrashed(true);
  }

  var same = target.getFilesByName(fileName);
  if (same.hasNext()) {
    same.next().setContent(bytes);
  } else {
    target.createFile(blob);
  }

  /* The name goes into the sheet here, not in the browser.
     The browser cannot read this script's reply, so if the browser wrote the
     name it would write a name for a picture that might never have been
     saved — and the sheet would name a file that is not there, and the sync
     would have nothing to download. Written here, the name only ever
     appears once the picture is really in Drive. */
  writeImageName_(slug, fileName, isMockup);

  return fileName;
}

/**
 * A file name, in the site's own convention: lowercase, words joined by
 * hyphens.
 */
function slugify_(value) {
  return String(value == null ? '' : value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * The name of a frame's file.
 *
 * The page title and the alt text — the two things that say what the frame
 * is — in the site's own convention. The alt text is what the editor typed
 * when the frame was uploaded, so the file says what the picture is without
 * anyone having to remember it later.
 *
 * The order is the last part, so two frames with the same alt text do not
 * land on the same file. It is the order the frame had when it was
 * uploaded: reordering the frames on the page does not rename the files.
 */
function galleryFileName_(client, alt, order, extension) {
  var title = slugify_(client) || 'frame';
  var words = slugify_(alt) || 'frame';
  var index = order < 10 ? '0' + order : String(order);
  var suffix = extension ? '.' + extension : '.jpg';
  return title + '-' + words + '-' + index + suffix;
}

/**
 * The client name of a case — the page's title.
 *
 * Read from the sheet rather than sent by the browser, so the name of the
 * file is built from what the sheet actually says.
 */
function clientName_(slug) {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));

  for (var tabName in CASE_TABS) {
    var tab = sheet.getSheetByName(CASE_TABS[tabName]);
    if (!tab) continue;

    var values = tab.getDataRange().getValues();
    var header = values[0].map(function (h) { return String(h || '').trim(); });
    var slugColumn = header.indexOf('slug');
    var clientColumn = header.indexOf('client');
    if (slugColumn === -1 || clientColumn === -1) continue;

    for (var i = 1; i < values.length; i += 1) {
      if (String(values[i][slugColumn]) !== slug) continue;
      return String(values[i][clientColumn] || '');
    }
  }

  return '';
}

/**
 * The file names the sheet names for a case's frames.
 *
 * Used by the banner's clean-up, so the frames in the folder are not thrown
 * away when the banner is replaced.
 */
function galleryFileNames_(slug) {
  var names = [];
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));

  for (var tabName in GALLERY_TABS) {
    var tab = sheet.getSheetByName(GALLERY_TABS[tabName]);
    if (!tab) continue;

    var values = tab.getDataRange().getValues();
    var header = values[0].map(function (h) { return String(h || '').trim(); });
    var slugColumn = header.indexOf('slug');
    var fileColumn = header.indexOf('file');
    if (slugColumn === -1 || fileColumn === -1) continue;

    for (var i = 1; i < values.length; i += 1) {
      if (String(values[i][slugColumn]) !== slug) continue;
      var file = String(values[i][fileColumn] || '');
      if (file && names.indexOf(file) === -1) names.push(file);
    }
  }

  return names;
}

/**
 * The file one frame has right now, as the sheet records it.
 *
 * Read before a new picture is saved, so the old one can be thrown away
 * when the alt text has changed and the file has been renamed.
 */
function galleryFileFor_(slug, order) {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));

  for (var tabName in GALLERY_TABS) {
    var tab = sheet.getSheetByName(GALLERY_TABS[tabName]);
    if (!tab) continue;

    var values = tab.getDataRange().getValues();
    var header = values[0].map(function (h) { return String(h || '').trim(); });
    var slugColumn = header.indexOf('slug');
    var orderColumn = header.indexOf('order');
    var fileColumn = header.indexOf('file');
    if (slugColumn === -1 || orderColumn === -1 || fileColumn === -1) continue;

    for (var i = 1; i < values.length; i += 1) {
      if (String(values[i][slugColumn]) !== slug) continue;
      if (String(values[i][orderColumn]) !== String(order)) continue;
      var file = String(values[i][fileColumn] || '');
      if (file) return file;
    }
  }

  return '';
}

/**
 * Save a frame into the case's folder.
 *
 * The frame's file is named after the page and the alt text, and its name
 * and its mock-up flag are written into all three of its tabs — together,
 * and only once the file is really in Drive. The flag belongs to the
 * picture, so it can never say one thing while the picture says another.
 */
function saveGalleryImage_(slug, order, alt, extension, dataUrl, isMockup) {
  var match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) throw new Error('the frame was not sent as a base64 image');

  var folder = driveFolder_();
  var folders = folder.getFoldersByName(slug);
  var target = folders.hasNext() ? folders.next() : folder.createFolder(slug);

  var fileName = galleryFileName_(clientName_(slug), alt, order, extension);

  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, match[1], fileName);

  /* The frame's previous file, if the alt text has changed and the name
     with it. It is replaced, not kept alongside. */
  var previous = galleryFileFor_(slug, order);
  if (previous && previous !== fileName) {
    var old = target.getFilesByName(previous);
    if (old.hasNext()) old.next().setTrashed(true);
  }

  var same = target.getFilesByName(fileName);
  if (same.hasNext()) {
    same.next().setContent(bytes);
  } else {
    target.createFile(blob);
  }

  writeGalleryFileName_(slug, order, fileName, isMockup);

  return fileName;
}

/**
 * Throw a frame's file away.
 *
 * The row goes from the sheet on the editor's side; this is the file in
 * Drive, so the folder does not fill up with pictures nothing points at.
 */
function trashGalleryFile_(slug, fileName) {
  var folder = driveFolder_();
  var folders = folder.getFoldersByName(slug);
  if (!folders.hasNext()) return false;

  var files = folders.next().getFilesByName(fileName);
  if (!files.hasNext()) return false;

  files.next().setTrashed(true);
  return true;
}

/**
 * Write a frame's file name into all three of its tabs — and the mock-up
 * flag with it.
 *
 * The name only appears once the file is really in Drive, so the sheet can
 * never name a picture that is not there. The flag says whether the
 * *picture* is generated artwork: it belongs to the picture, so it is
 * written at the same moment as the name and never separately.
 */
function writeGalleryFileName_(slug, order, fileName, isMockup) {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));

  for (var tabName in GALLERY_TABS) {
    var tab = sheet.getSheetByName(GALLERY_TABS[tabName]);

    /* A sheet that has never had a frame in it may not have the tab yet. */
    if (!tab) {
      tab = sheet.insertSheet(GALLERY_TABS[tabName]);
      tab.getRange(1, 1, 1, GALLERY_COLUMNS.length).setValues([GALLERY_COLUMNS]);
    }

    var values = tab.getDataRange().getValues();
    var header = values[0].map(function (h) { return String(h || '').trim(); });
    var slugColumn = header.indexOf('slug');
    var orderColumn = header.indexOf('order');
    var fileColumn = header.indexOf('file');
    var mockupColumn = header.indexOf('mockup');
    if (slugColumn === -1 || orderColumn === -1 || fileColumn === -1) continue;

    var found = false;
    for (var i = 1; i < values.length; i += 1) {
      if (String(values[i][slugColumn]) !== slug) continue;
      if (String(values[i][orderColumn]) !== String(order)) continue;
      found = true;
      tab.getRange(i + 1, fileColumn + 1).setValue(String(fileName));
      if (mockupColumn !== -1 && isMockup !== undefined && isMockup !== null) {
        tab.getRange(i + 1, mockupColumn + 1).setValue(isMockup ? 'true' : 'false');
      }
    }

    /* A frame the sheet has no row for yet — the row is written by the
       editor's page, but a hand-made upload may arrive first. */
    if (!found) {
      var row = [];
      for (var c = 0; c < GALLERY_COLUMNS.length; c += 1) row.push('');
      row[slugColumn] = slug;
      row[orderColumn] = String(order);
      row[fileColumn] = String(fileName);
      if (mockupColumn !== -1) row[mockupColumn] = isMockup ? 'true' : 'false';
      tab.getRange(values.length + 1, 1, 1, GALLERY_COLUMNS.length).setValues([row]);
    }
  }

  /* And a note for the editor's page, which waits for it before it writes
     the row that names the frame. The time is part of it, so a frame that
     is uploaded twice under the same name is still a new save. */
  setSetting_('lastGalleryImageSaved', fileName + '|' + new Date().toISOString());
}

/**
 * Write a case's picture name into all three of its tabs — and the mock-up
 * flag with it.
 *
 * The flag says whether the *picture* is generated artwork. It belongs to the
 * picture, so it is written at the same moment as the picture's name and
 * never separately. That is what keeps the two together: a case cannot say
 * "this is real photography" while the picture on the page is still the
 * mock-up, which would put unlabelled artwork on a client-facing site.
 *
 * The picture is the same in every language, so both go in all three tabs.
 */
function writeImageName_(slug, fileName, isMockup) {
  var sheet = SpreadsheetApp.openById(scriptProperty_('SPREADSHEET_ID'));
  var header = CASE_TABS;

  for (var tabName in header) {
    var tab = sheet.getSheetByName(header[tabName]);
    if (!tab) continue;

    var values = tab.getDataRange().getValues();
    var slugColumn = values[0].indexOf('slug');
    var imageColumn = values[0].indexOf('image');
    var mockupColumn = values[0].indexOf('mockup');
    if (slugColumn === -1 || imageColumn === -1) continue;

    for (var i = 1; i < values.length; i += 1) {
      if (String(values[i][slugColumn]) !== slug) continue;
      tab.getRange(i + 1, imageColumn + 1).setValue(String(fileName));
      if (mockupColumn !== -1 && isMockup !== undefined && isMockup !== null) {
        tab.getRange(i + 1, mockupColumn + 1).setValue(isMockup ? 'true' : 'false');
      }
    }
  }

  /* And a note for the editor's page, which waits for it before it writes
     the row that names the picture. */
  setSetting_('lastImageSaved', fileName);
}

/**
 * The poller — the sheet is the trigger.
 *
 * This runs every minute. It looks at the sheet: if the content has changed
 * since the last time it asked for a build, it asks for one.
 *
 * This is what makes the editor's job one action. They fill in the form and
 * press Save; the sheet records that the content changed; this notices, and
 * the site rebuilds. There is no publish button to press and no progress bar
 * to watch.
 *
 * Only somebody who can write to the sheet can set that stamp, so knowing
 * this script's address is not enough to make it rebuild the site.
 */
function pollSheet() {
  var settings = settings_();

  var changed = settings.contentChanged || '';
  var published = settings.lastPublishedAt || '';
  if (!changed) return;
  if (published && Date.parse(changed) <= Date.parse(published)) return;

  try {
    triggerPublish_();
    setSetting_('lastPublishedAt', new Date().toISOString());
  } catch (error) {
    /* The build could not be asked for. It is recorded, and the next poll
       tries again — the sheet still says the content changed. */
    setSetting_('lastPublishStatus', 'failed');
    setSetting_('lastPublishMessage', error.message);
  }
}

/**
 * Make sure the poller is running.
 *
 * The trigger is created here rather than by hand, so the sheet and the
 * script cannot end up out of step: whoever opens the script's address
 * turns the poller on.
 */
function ensurePollTrigger_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i += 1) {
    if (triggers[i].getHandlerFunction() === 'pollSheet') return true;
  }
  ScriptApp.newTrigger('pollSheet').timeBased().everyMinutes(1).create();
  return false;
}

/**
 * Ask GitHub to rebuild the site.
 *
 * The token is a script property. It never reaches the browser.
 *
 * The dispatch is only half the story: the browser cannot read a reply, so
 * it cannot know whether the run started, let alone whether it passed. So
 * the outcome is reported through the sheet's `settings` tab — where the
 * editor's page can read it and say what actually happened.
 *
 * This script cannot write the final answer itself. The build happens
 * after this has answered, and a web app's request cannot wait for a
 * build. So this stamps `dispatched`, and the report workflow writes `ok`
 * or `failed` into the sheet when the build is done. If the build has
 * already finished by the time this looks, the result is written here.
 *
 * `lastPublishStatusAt` says which publish a status belongs to. The status
 * alone cannot: two publishes in a row both end in `ok`, and the editor's
 * page has to be able to tell the first one's result from the second's.
 *
 * A request is only honoured if the sheet says it was asked for. The editor's
 * page writes `publishRequested` into the sheet before it posts here, and
 * only somebody who can write to the sheet can do that. So knowing this
 * script's address is not enough to make it rebuild the site — the sheet's
 * own sharing is the gate.
 */
function triggerPublish_() {
  var owner = setting_('GITHUB_OWNER');
  var repo = setting_('GITHUB_REPO');
  var token = scriptProperty_('GITHUB_TOKEN');

  /* The stamp goes in before the dispatch, not after it. The editor's page
     watches this value to know the request was taken, and it should not have
     to wait for GitHub to answer. */
  var stamp = new Date().toISOString();
  setSetting_('lastPublish', stamp);
  setSetting_('lastPublishStatus', 'dispatched');
  setSetting_('lastPublishStatusAt', stamp);

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
      payload: JSON.stringify({ event_type: 'publish' }),
      muteHttpExceptions: true,
    },
  );

  if (response.getResponseCode() !== 204) {
    /* GitHub would not take the request, so no build was started. The
       editor's page reads `unknown` as "the build did not start", which is
       exactly what happened. */
    setSetting_('lastPublishStatus', 'unknown');
    setSetting_(
      'lastPublishMessage',
      'GitHub refused the publish (' + response.getResponseCode() + ')',
    );
    throw new Error(
      'GitHub refused the publish (' +
        response.getResponseCode() +
        '): ' +
        response.getContentText(),
    );
  }

  /* A short look at the run. If the build has already finished, the
     outcome is known now and is written down. If it is still going, the
     report workflow writes the result when it ends — this script has
     answered by then, and a web app's request cannot wait for a build. */
  var outcome = watchRun_(owner, repo, token, stamp);
  if (outcome.status === 'ok' || outcome.status === 'failed') {
    setSetting_('lastPublishStatus', outcome.status);
    if (outcome.message) setSetting_('lastPublishMessage', outcome.message);
  }

  return outcome;
}

/**
 * Watch the workflow run the dispatch started.
 *
 * Returns `{ status, message }`. The wait is deliberately short. A web app's
 * request has to be answered in seconds and the build takes a minute, so
 * waiting for the build here would only risk the request being cut off. If
 * the build is still going when the wait ends, the report workflow writes
 * the result when it ends.
 *
 * A run that has not appeared at all is not treated as a failure: GitHub
 * can be slow to start one, and saying "failed" when the build is about to
 * start would be worse than saying nothing.
 */
function watchRun_(owner, repo, token, stamp) {
  var started = Date.parse(stamp);
  var deadline = Date.now() + 5 * 1000;

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

    Utilities.sleep(1500);
  }

  return {
    status: 'running',
    message: 'the build has not finished yet — the report workflow will say how it went',
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
  var action = String(request.parameter.action || '').toLowerCase();

  try {
    if (action === 'image') {
      var slug = String(request.parameter.slug || '').trim();
      var fileName = String(request.parameter.fileName || '').trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error('the slug "' + slug + '" is not a valid route id');
      }
      if (!fileName || fileName.indexOf('/') !== -1) {
        throw new Error('the file name "' + fileName + '" is not valid');
      }
      saveImage_(
        slug,
        fileName,
        request.parameter.dataUrl || '',
        String(request.parameter.mockup || 'true') === 'true',
      );
      return reply_('The picture was saved.');
    }

    if (action === 'gallery-image') {
      var frameSlug = String(request.parameter.slug || '').trim();
      var frameOrder = Number(request.parameter.order || 0);
      var frameAlt = String(request.parameter.alt || '');
      var frameExt = String(request.parameter.ext || 'jpg')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frameSlug)) {
        throw new Error('the slug "' + frameSlug + '" is not a valid route id');
      }
      if (!frameOrder || frameOrder < 1 || frameOrder > GALLERY_MAX_FRAMES) {
        throw new Error(
          'the frame order "' + frameOrder + '" is not between 1 and ' + GALLERY_MAX_FRAMES,
        );
      }
      if (!frameExt) frameExt = 'jpg';
      saveGalleryImage_(
        frameSlug,
        frameOrder,
        frameAlt,
        frameExt,
        request.parameter.dataUrl || '',
        String(request.parameter.mockup || 'true') === 'true',
      );
      return reply_('The frame was saved.');
    }

    if (action === 'gallery-delete') {
      var deleteSlug = String(request.parameter.slug || '').trim();
      var deleteFile = String(request.parameter.fileName || '').trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(deleteSlug)) {
        throw new Error('the slug "' + deleteSlug + '" is not a valid route id');
      }
      if (!deleteFile || deleteFile.indexOf('/') !== -1) {
        throw new Error('the file name "' + deleteFile + '" is not valid');
      }
      trashGalleryFile_(deleteSlug, deleteFile);
      return reply_('The frame was deleted.');
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
  /* The poller — the sheet is the trigger, so this has to be running. */
  checks.push(checkPoller_());

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
    /* A FolderIterator counts itself with getCount(), not with length. */
    var count = folder.getFolders().getCount();
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

/**
 * Is the poller running?
 *
 * The poller is what notices that the sheet changed and asks for a build.
 * If it is not running, the site only updates when somebody presses a
 * button — so it is made here, and reported.
 */
function checkPoller_() {
  var running = ensurePollTrigger_();
  return {
    name: 'The poller',
    ok: true,
    detail: running
      ? 'already running — the site rebuilds within a minute of a change'
      : 'started — it now runs every minute',
  };
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
