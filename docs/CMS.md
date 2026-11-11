# The works CMS — a form on the website, a sheet behind it

> The works page is the only part of the site an editor changes themselves.
> Everything else — the client wall, the services menu, the offices, the
> hero, the credentials — stays hand-edited in the repository.

This is the operating manual: how it works, how to set it up, and what to do
when something goes wrong.

---

## 1. What the editor sees

One address. One button.

```
https://migather.com/en/admin
```

- **Sign in with Google.** Their own Migather account. Nothing is stored —
  closing the tab forgets the token.
- **Pick a case, pick a language, fill in the form.** The form is pre-filled
  from the sheet, so it shows the copy as it stands today.
- **Save.** The sheet is written as them. That is it — the copy is saved.
- **Publish to the site.** The site rebuilds. The page says whether it
  worked, and says so honestly: it watches the build and reports what
  happened, rather than saying "publishing" and leaving you to guess.

No git. No commit. No workflow. No Actions tab. The editor never has to know
any of that exists.

---

## 2. How it works

```
  /admin on the website
    │
    ├─ sign in ───────────► Google Identity Services
    │                        (an access token, in memory, for the tab)
    │
    ├─ read the copy ─────► Google Sheets API, as the editor
    ├─ write the copy ────► Google Sheets API, as the editor
    └─ the picture ───────► a form post to the Apps Script
                             (it runs as the editor, and has storage quota)
                                │
                                └─ the Drive folder

  Publish to the site
    └─ a form post to the Apps Script
         └─ GitHub: repository_dispatch
              └─ the sync workflow: pull → validate → compile → commit
                   └─ the publish workflow: verify → build → deploy
```

### Why there is a script at all

Only two things, and neither can happen in the browser:

1. **The picture.** A service account has no Drive storage quota, and a
   browser cannot write to Drive without a Drive scope on the editor's
   account — which would mean asking the editor for access to their entire
   Drive. So the picture is posted to the Apps Script, which runs as the
   editor and has quota. The editor grants one scope: `spreadsheets`.

2. **The publish.** It needs a GitHub token, and a token must not live in a
   browser. The script holds it in its properties and fires the workflow.

The browser cannot read a reply from the Apps Script — Google sends no CORS
headers — so the script reports back by writing into the sheet's `settings`
tab, where the editor's page can read it. That is how "Published" is a
fact rather than a hope.

### Why the public pages are still a static build

The site is served from GitHub Pages, which serves files. A page cannot ask
the Sheets API for content when a reader opens it. So the sheet is pulled at
build time, committed, and built — and the committed copy is what the
public sees.

That means:

- The public pages are fast and are up even if Google is down.
- A published change is a commit: reviewable, revertible, and screened by
  the copy screen like any other copy.
- The site takes a minute or two to catch up after a publish. That is the
  price of a static site, and it is the right price for a marketing site.

---

## 3. Setting it up

### 3.1 The sheet

One sheet, **nine content tabs** plus a `settings` tab:

| Tab | Holds |
| --- | --- |
| `cases_EN` `cases_ZH-HANT` `cases_ZH-HANS` | one row per case, one locale per tab |
| `results_EN` `results_ZH-HANT` `results_ZH-HANS` | one row per result |
| `scope_EN` `scope_ZH-HANT` `scope_ZH-HANS` | one row per scope line |
| `settings` | the editor allow-list, the repository coordinates, and the last publish |

The columns are in `tools/cms/lib/schema.mjs`, and the seed writes the
header rows for you.

**Keep the sheet private.** It holds unpublished drafts and client names.
Only the agency account and the service account should be able to open it —
that sharing is the real gate, and the allow-list is a friendly layer on
top.

### 3.2 The Drive folder

One folder, with one sub-folder per case, named after the case's slug. The
picture sits inside it. The slug is the folder name, so the sync finds the
picture without a lookup table.

### 3.3 The service account

1. Create a service account and download a JSON key.
2. **Enable the Google Sheets API and the Google Drive API** on the project.
   A fresh project has neither, and the failure is a `403` that says so only
   obliquely.
3. Share the Sheet and the Drive folder with the service account's address
   — as an editor on the sheet (the sync writes to it) and a viewer on the
   Drive folder.
4. Add the key as a repository secret named `GCP_SERVICE_ACCOUNT_JSON`, and
   the sheet and folder ids as `CMS_SPREADSHEET_ID` and
   `CMS_DRIVE_FOLDER_ID`.

The key never enters the repository and never reaches a browser.

### 3.4 The OAuth client

The editor signs in with their own Google account, so the sheet is written
as *them*. That needs an OAuth client id.

**Google Cloud console → your project → APIs & Services → Credentials →
Create credentials → OAuth client ID → Web application:**

- **Name**: `Migather works editor`
- **Authorised JavaScript origins**: the site's origin —
  `https://oneup24.github.io` now, and `https://migather.com` when the
  domain is live.
- **Authorised redirect URIs**: **the same origin** —
  `https://oneup24.github.io`, and `http://localhost:4180` for the local
  preview. The sign-in popup comes back to the page's own address, so the
  address has to be registered here as well as under JavaScript origins.
  Without it Google answers `redirect_uri_mismatch` and the sign-in never
  happens.

The client id is in `src/data/cms.js`, alongside the sheet id and the
script's address. None of the three is a credential — the sheet's own
sharing is what protects the content — and keeping them in the repository
means the published build works without anybody having to configure
anything. The `VITE_CMS_*` environment variables override them for anyone
who would rather they stayed out; see `.env.example`.

### 3.5 The Apps Script

One script, two jobs. Create a standalone Apps Script project, paste
`apps-script/Code.gs`, and set the script properties:

| Property | Value |
| --- | --- |
| `SPREADSHEET_ID` | the sheet id |
| `DRIVE_FOLDER_ID` | the Drive folder id |
| `GITHUB_TOKEN` | a token with write access to the repository |
| `GITHUB_OWNER` | the repository owner |
| `GITHUB_REPO` | the repository name |

The repository coordinates may also sit on the sheet's `settings` tab, on
the `github_owner` and `github_repo` rows, which take precedence.

Deploy as a web app: **execute as you**, access **"Anyone with a Google
account"**. The browser posts here from a hidden frame, which makes it a
first-party request for script.google.com and therefore carries the
editor's Google session.

### 3.6 Seeding the sheet

```bash
node tools/cms/seed-sheet.mjs \
  --spreadsheet <sheet-id> \
  --drive-folder <folder-id> \
  --credentials ./service-account.json \
  --editors "you@migather.com" \
  --github-owner oneup24 --github-repo migather-www
```

This writes the nine tabs with their headers, pushes the cases in all three
languages, and writes the settings tab. It is re-runnable and never
clobbers: a case whose slug is already in a tab is left alone.

> The service account cannot upload to Drive — it has no storage quota. The
> 16 pictures were uploaded by hand; the editor's browser now hands new ones
> to the Apps Script, which runs as the editor and has quota.

### 3.7 The editor allow-list

The `editors` row of the `settings` tab, comma-separated. It can be
managed from the command line:

```bash
npm run cms:editors -- --list
npm run cms:editors -- --add someone@migather.com
npm run cms:editors -- --remove someone@migather.com
```

The script reads the row on every request, so a change takes effect
immediately. Nothing needs redeploying.

---

## 4. The content contract

### `cases_<locale>` — one row per case

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | text | Route id, `^[a-z0-9-]+$`, unique. Also the Drive folder name. |
| `client` | text | e.g. `Huatai Finance HK`. The same in every language. |
| `clientLocal` | text | e.g. `華泰證券`. Shown under the client name. |
| `projectLocal` | text | Optional. |
| `sector` | dropdown | The keys in `src/data/sectors.js`. |
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
check that catches a client name edited in one language only. The editor's
page writes them to all three, so they cannot drift by accident.

### `results_<locale>` — one row per result

`slug`, `order`, `value` (e.g. `+38%`), `label`, `note` (optional).
`value` is not localised but is repeated per tab and must agree.

### `scope_<locale>` — one row per scope line

`slug`, `order`, `text`.

### The compiled output

```
content/cases/<slug>.json        one file per case, all three locales merged
public/media/cases/<slug>/<file> the picture, downloaded from Drive
```

`src/data/cases.js` is a loader over those files and keeps exporting
`sectors` and `getCase`. The picture travels with the case: the record
carries `image: { src, alt: { en, zh-Hant, zh-Hans }, mockup }`.

---

## 5. What the sync refuses to publish

The sync fails the build, with the case and the column named, on:

- a missing required field;
- an unknown `sector` or service key;
- a duplicate slug, or a slug that is not a valid route id;
- a published case with no `source`;
- a published case with no picture;
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
| The editor signs in but sees "not on the editor list" | The `editors` row in the sheet. Add the address. |
| The editor signs in and the case list is empty | The sheet could not be read. Check that the account has access — the sheet's sharing is the gate. |
| "The sheet could not be written" | The token's scope was not granted, or the account has no edit access to the sheet. |
| The picture did not appear | The Apps Script could not save it. The sync will fail and name the case. Re-upload. |
| "The build did not succeed" | The page is reporting a failed build. Open the Actions tab on GitHub to see why — usually a banned word or a missing source. |
| "The build did not start — the GitHub token may have expired" | The token in the Apps Script's properties has expired. Make a new one. |
| Nothing happens after "Published" | The build ran but the deploy is still going. The publish workflow runs after the sync workflow; give it a minute or two. |

---

## 7. Reviewing a published change

Every published change is a commit:

```bash
git log --oneline -- content/cases
git show <commit> -- content/cases
```

The diff shows the copy that changed, in the three languages, and nothing
else. To undo it, revert the commit and publish again.

The screens a change has to pass are `npm run verify` — the route renders,
the copy screen over the data modules *and* the compiled case files, the
content check, and the sitemap — plus `npm run audit:dom`, which drives the
real page and checks that every published case shows its picture, names its
source, and is labelled as a mock-up exactly when its record says so.

---

## 8. The tools

| Command | What it does |
| --- | --- |
| `npm run cms:migrate` | The one-off migration: the pre-CMS data modules into `content/cases/*.json` and `public/media/cases/`. |
| `npm run cms:seed` | The one-off migration into the Sheet and Drive. `--fixtures <dir>` writes the tabs locally instead. |
| `npm run cms:sync` | The ongoing pull: Sheet + Drive → the compiled content. `--fixtures <dir>` reads a local copy; `--dry-run` writes nothing. |
| `npm run cms:preview` | Renders the editor page locally with mock data, so it can be reviewed without a Google project. |
| `npm run cms:editors` | Shows, adds to or removes from the editor allow-list. |
| `npm run cms:test` | Runs the Apps Script against a mocked Drive and a mocked GitHub. |
| `npm run cms:test:page` | Runs the editor page against mocked Google APIs. |
| `npm run check:content` | Checks the compiled content: every published case has a picture, a source, and alt text in all three languages. |

The library the three share is in `tools/cms/lib/`: `schema.mjs` (the
contract), `records.mjs` (records ↔ rows), `compile.mjs` (the validator and
the compiler), `google.mjs` (the APIs), `vocab.mjs` (the sectors and the
service keys).

There are no npm dependencies: the service account signs its own JWT with
`node:crypto`. The only external tool is Pillow, which resizes the pictures.
