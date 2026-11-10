# The works CMS — Google Sheet + Drive, behind an Apps Script form

> The works page is the only part of the site an editor changes themselves.
> Everything else — the client wall, the services menu, the offices, the
> hero, the credentials — stays hand-edited in the repository.

This is the operating manual: how the pieces fit, how to set it up, what the
editor sees, and what happens when something is wrong.

---

## 1. The shape of it

```
  Google Sheet (9 tabs × 3 locales)   Google Drive (a folder per case)
            │                                   │
            └──────────────┬────────────────────┘
                           ▼
             Apps Script web app  ── Save ──► writes Sheet + Drive
                             └─ Save & publish ──► repository_dispatch
                           ▼
   GitHub Actions: sync-cases ── pull ── validate ── compile ── commit to main
                           ▼
   publish-preview workflow ── builds from the committed files ──► gh-pages
```

Two properties fall out of this shape, and both matter:

- **The build never depends on Google.** `content/cases/*.json` and
  `public/media/cases/**` are committed. If Google is down or the sheet is
  malformed, the sync fails, nothing is committed, and the site keeps serving
  the last good content.
- **The content stays in git.** Every published change is a commit:
  reviewable, revertible, and screened by the copy screen like any other
  copy.

**How the publish actually reaches the site.** The sync workflow commits with
the repository's own token, and GitHub does not raise a `push` event for a
push made with that token. So the publish workflow listens for the *sync's
completion* (`workflow_run`) as well as for pushes to `main`. By the time the
sync workflow finishes, its commit is already on `main`, and the publish
workflow builds from it — after running `npm run verify`, which it now does
before every deploy.

If the agency would rather a change be reviewed before it goes live, the
sync workflow is where that changes: push a branch and open a pull request
instead of pushing to `main`.

---

## 2. Setting it up

**Two actors, two different permissions.** It is worth being clear about this
before you start, because it is the part that usually goes wrong.

| | Who it is | What it needs |
| --- | --- | --- |
| **The form** (the Apps Script) | The person who deployed it — the script runs *as them* | **Editor** on the Sheet and the Drive folder, because it writes to both on the editor's behalf |
| **The sync** (GitHub Actions) | A service account | **Reader** on the Sheet, **reader** on the Drive folder, because it only pulls |

So the deploying person needs edit rights on the sheet, and the service
account needs read rights. Give the service account Editor too if you would
rather not think about it — it changes nothing the sync does.

### 2.1 The Sheet

Create a Google Sheet with **nine content tabs** plus a `settings` tab:

| Tab | Holds |
| --- | --- |
| `cases_EN` `cases_ZH-HANT` `cases_ZH-HANS` | one row per case, one locale per tab |
| `results_EN` `results_ZH-HANT` `results_ZH-HANS` | one row per result |
| `scope_EN` `scope_ZH-HANT` `scope_ZH-HANS` | one row per scope line |
| `settings` | the editor allow-list, the repository coordinates, and the vocabulary the form offers |

The exact columns are in `tools/cms/lib/schema.mjs`, and the seed writes the
header rows for you — run the seed before editing anything by hand.

**Keep the sheet private.** It holds unpublished drafts and client names.

### 2.2 The Drive folder

One folder, with one sub-folder per case, named after the case's slug. The
image file sits inside it. The slug is the folder name, so the sync finds
the folder without a lookup table.

**The service account must be able to see it.** A folder that is private to
one person's Drive is invisible to the service account — the Drive API
answers `404 File not found`, and `files.list` returns an empty list rather
than an error, so the symptom is easy to misread as "the folder is empty".
Share the folder with the service account's address, and with the Google
account that deploys the Apps Script, as editors.

**Turn off "anyone with the link" on the Sheet.** A Google Sheet created
through the console sometimes carries a link-sharing permission with the
role *writer*. On the works sheet that is not acceptable: anyone with the
link could change the copy that gets published. Replace it with explicit
shares — the service account and the deploying account as editors.

### 2.3 The service account

1. In the Google Cloud console, create a service account and download a JSON
   key.
2. **Enable the two APIs** on the project — *APIs & Services → Library* →
   **Google Sheets API** and **Google Drive API** → Enable. A fresh project
   has neither, and the failure is a `403` that says so only obliquely:
   *"Google Sheets API has not been used in project … before or it is
   disabled."*
3. Share the Sheet and the Drive folder with the service account's address
   (`…@….iam.gserviceaccount.com`) — as an editor on the Sheet, and as a
   file/folder viewer on Drive.
4. Add the key as a repository secret named `GCP_SERVICE_ACCOUNT_JSON`, and
   the sheet and folder ids as `CMS_SPREADSHEET_ID` and
   `CMS_DRIVE_FOLDER_ID`.

The key never enters the repository and never reaches a browser.

### 2.4 The Apps Script

**Run the seed first** (§2.6). The form's allow-list lives in the sheet's
`settings` tab, so a form deployed against a sheet with no `settings` tab
opens to "the editor allow-list is: (empty)" and refuses everyone.

1. Create a standalone Apps Script project, or a bound one on the Sheet.
2. Paste `apps-script/Code.gs` into `Code.gs` and `apps-script/Index.html`
   into `Index.html`.
3. Set the script properties (Project Settings → Script properties):

   | Property | Value |
   | --- | --- |
   | `SPREADSHEET_ID` | the sheet id |
   | `DRIVE_FOLDER_ID` | the Drive folder id |
   | `GITHUB_TOKEN` | a token with write access to the repository |
   | `GITHUB_OWNER` | the repository owner |
   | `GITHUB_REPO` | the repository name |

4. Put the editor email addresses in the `settings` tab, on the `editors`
   row, separated by commas. The seed also writes the `sectors` and
   `services` rows there — the site's own taxonomy, so the form cannot offer
   a service or a sector the site does not have.

   The list can be managed from the command line instead of by hand:

   ```bash
   npm run cms:editors -- --list
   npm run cms:editors -- --add someone@example.com
   npm run cms:editors -- --remove someone@example.com
   ```

   The script reads the row on every request, so a change takes effect
   immediately — nothing needs redeploying.
5. Deploy as a web app: execute as you, access "Anyone with a Google
   account". The allow-list in the sheet is what actually decides who may
   edit — the deploy setting is only there so the script can read
   `Session.getActiveUser()`.

### 2.5 Seeding the sheet

```bash
node tools/cms/seed-sheet.mjs \
  --spreadsheet <sheet-id> \
  --drive-folder <folder-id> \
  --credentials ./service-account.json
```

This writes the 16 existing cases into the sheet and their images into
Drive. It is re-runnable and it never clobbers: a case whose slug is already
in a tab is left alone.

Check it worked without writing to Google first:

```bash
node tools/cms/seed-sheet.mjs --fixtures ./fixtures
node tools/cms/sync-cases.mjs --fixtures ./fixtures --dry-run
```

The second command must report every case compiled cleanly. If it does, the
migration is lossless — the same cases went into the sheet as rows and come
back out as byte-identical case files.

---

## 3. The content contract

### `cases_<locale>` — one row per case

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | text | Route id, `^[a-z0-9-]+$`, unique. Also the Drive folder name. |
| `client` | text | e.g. `Huatai Finance HK`. The same in every language. |
| `clientLocal` | text | e.g. `華泰證券`. Shown under the client name. |
| `projectLocal` | text | Optional. |
| `sector` | dropdown | `finance` `properties` `travel` `luxury` `lifestyle` — the keys in `src/data/sectors.js`. |
| `services` | multi-select | The service keys from `src/data/services.js`, comma separated. This is the "category" field. |
| `partnershipSince` | text | e.g. `July 2021` / `2021年7月`. |
| `summary` | long text | The case summary. |
| `imageAlt` | text | Alt text. The sync prefixes `Mock-up: ` when the mock-up flag is set — the editor never types it. |
| `image` | text | The file name inside the case's Drive folder. |
| `mockup` | dropdown | `true` / `false` — generated artwork vs a real client photograph. |
| `source` | text | **Required.** The credential deck and slide the case came from. |
| `featured` | dropdown | `true` / `false` |
| `published` | dropdown | `true` / `false` — the draft/publish state |

The locale-independent columns (`slug`, `client`, `sector`, `services`,
`source`, `image`, `mockup`, `featured`, `published`) are repeated in all
three tabs. **The sync fails the build if they disagree** — that is the
check that catches a client name edited in one language only.

### `results_<locale>` — one row per result

`slug`, `order`, `value` (e.g. `+38%`), `label`, `note` (optional).
`value` is not localised but is repeated per tab and must agree.

### `scope_<locale>` — one row per scope line

`slug`, `order`, `text`.

### The compiled output

```
content/cases/<slug>.json        one file per case, all three locales merged
public/media/cases/<slug>/<file> the image, downloaded from Drive
```

`src/data/cases.js` is a loader over those files and keeps exporting
`sectors` and `getCase`. The image travels with the case: the record
carries `image: { src, alt: { en, zh-Hant, zh-Hans }, mockup }`.

---

## 4. What the editor sees

The form is one case, one language at a time.

- **The case picker** lists every case with how many of its three languages
  are ready (`2 of 3 languages`) and whether it is published or a draft.
- **The fields** are the columns above, for the selected language only. The
  locale-independent fields are written to all three tabs by the script, so
  they cannot drift by accident.
- **The categories** are a set of checkboxes — the 25 service lines of the
  site's own menu, read from the sheet's `settings` tab.
- **The image** is uploaded from the browser as base64 and saved into the
  case's Drive folder.
- **Save** stores the case as a draft.
- **Save & publish** stores the case, sets `published: true` on every tab
  and fires the `repository_dispatch` that starts the rebuild. It only
  publishes when all three languages are ready — otherwise the case stays a
  draft and the form says how many languages are ready.

The GitHub token lives in the script's properties. It is never in the
repository and never in the browser.

---

## 5. What the sync refuses to publish

The sync fails the build, with the case and the column named, on:

- a missing required field;
- an unknown `sector` or service key;
- a duplicate slug, or a slug that is not a valid route id;
- a published case with no `source`;
- a published case with no image;
- a case whose locale-independent fields disagree across the tabs;
- a published case missing from one of the locale tabs;
- a published case whose copy is only partly filled in one language;
- a case with a different number of results or scope lines in different
  languages, or a result figure that differs between them.

A draft case is allowed to be unfinished. That is what a draft is for.

---

## 6. When something goes wrong

| What breaks | What happens |
| --- | --- |
| Google is down, or the sheet is malformed | The sync fails, nothing is committed, the site keeps the last good content. The editor sees the error in the sync output. |
| A case is saved with a banned word | The copy screen fails the build, the site does not publish. The editor sees it in the sync output. |
| A published case has no source, or no image | The sync refuses to compile it and names the case and the column. |
| One language is filled and the others are not | The case is not published; it stays a draft. The form shows "1 of 3 languages ready". |
| The editor and the Chinese scripts | The form edits one locale per session, and the sync rejects a case whose locale-independent fields disagree between tabs. |
| A real photograph replaces a mock-up | The flag flips, the `MOCK-UP` tag and the `Mock-up: ` alt prefix disappear for that case, and the footer's standing disclosure shrinks. |
| The workflow cannot push to `main` | The commit fails. Either the repository has branch protection on `main` — in which case switch the sync workflow to a branch and a pull request — or the workflow needs `contents: write`, which it has. |

---

## 7. Reviewing a published change

Every published change is a commit. To review one:

```bash
git log --oneline -- content/cases
git show <commit> -- content/cases
```

The diff shows the copy that changed, in the three languages, and nothing
else. To undo it, revert the commit and the site publishes the previous
content.

The screens that a change has to pass are `npm run verify` — the route
renders, the copy screen over the data modules *and* the compiled case
files, the content check, and the sitemap — plus `npm run audit:dom`, which
drives the real page and checks that every published case shows its image,
names its source, and is labelled as a mock-up exactly when its record says
so.

---

## 8. The tools

| Command | What it does |
| --- | --- |
| `npm run cms:migrate` | The one-off migration: the pre-CMS data modules into `content/cases/*.json` and `public/media/cases/`. |
| `npm run cms:seed` | The one-off migration into the Sheet and Drive. `--fixtures <dir>` writes the tabs locally instead. |
| `npm run cms:sync` | The ongoing pull: Sheet + Drive → the compiled content. `--fixtures <dir>` reads a local copy; `--dry-run` writes nothing. |
| `npm run check:content` | Checks the compiled content: every published case has an image, a source, and alt text in all three languages. |
| `npm run cms:preview` | Renders the editor form locally with mock data, so it can be reviewed without a Google project. |
| `npm run cms:editors` | Shows, adds to or removes from the editor allow-list in the sheet's `settings` tab. |
| `npm run cms:test` | Runs the Apps Script against a mocked sheet — a new case, an edited case, the publish rule and the allow-list. |

The library the three share is in `tools/cms/lib/`: `schema.mjs` (the
contract), `records.mjs` (records ↔ rows), `compile.mjs` (the validator and
the compiler), `google.mjs` (the APIs), `vocab.mjs` (the sectors and the
service keys).

There are no npm dependencies: the service account signs its own JWT with
`node:crypto`. The only external tool is Pillow, which resizes the images
the editor uploads.
