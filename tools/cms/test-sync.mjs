/**
 * A test of the sync, against a fixture of the sheet.
 *
 * The sync is the thing that turns the sheet into the site, and it has one
 * job that is easy to get wrong: it must never let the site break.
 *
 * The case that matters is a picture that is named in the sheet but is not
 * in Drive. It happens when an upload fails, and it is the one path where
 * the site could publish a broken image — or, worse, publish generated
 * artwork with no mock-up label on it.
 *
 * Usage:
 *   node tools/cms/test-sync.mjs
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CONTENT = join(ROOT, 'content', 'cases');

let failed = 0;
function check(label, condition, detail = '') {
  if (condition) console.log(`  ok    ${label}`);
  else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

/** The sheet, as a fixture: the content tabs and the pictures. */
function buildFixture(directory, { pictureMissing = false, frameMissing = false } = {}) {
  mkdirSync(directory, { recursive: true });

  const cases = ['cases_EN', 'cases_ZH-HANT', 'cases_ZH-HANS'];
  const results = ['results_EN', 'results_ZH-HANT', 'results_ZH-HANS'];
  const scope = ['scope_EN', 'scope_ZH-HANT', 'scope_ZH-HANS'];
  const gallery = ['gallery_EN', 'gallery_ZH-HANT', 'gallery_ZH-HANS'];

  const caseRows = [
    ['slug', 'client', 'clientLocal', 'projectLocal', 'sector', 'services', 'partnershipSince',
      'summary', 'imageAlt', 'image', 'mockup', 'source', 'featured', 'published'],
  ];
  const resultRows = [['slug', 'order', 'value', 'label', 'note']];
  const scopeRows = [['slug', 'order', 'text']];
  const galleryRows = [['slug', 'order', 'file', 'alt', 'caption', 'mockup']];

  for (const [index, tab] of [...cases, ...results, ...scope, ...gallery].entries()) {
    const file = join(directory, `${tab}.json`);
    if (tab.startsWith('cases_')) {
      writeFileSync(
        file,
        JSON.stringify(
          [
            caseRows[0],
            [
              'huatai-finance-hk',
              'Huatai Finance HK',
              '華泰證券',
              '',
              'finance',
              'strategic-creative, kol',
              'July 2021',
              'A one-stop programme.',
              'Mock-up: a financial district at dawn.',
              pictureMissing ? 'a-picture-that-is-not-there.jpg' : 'case-huatai.jpg',
              'true',
              'Deck p.4',
              'true',
              'true',
            ],
          ],
          null,
          2,
        ),
      );
    } else if (tab.startsWith('results_')) {
      writeFileSync(file, JSON.stringify([resultRows[0], ['huatai-finance-hk', '1', '+38%', 'Fans', '']], null, 2));
    } else if (tab.startsWith('scope_')) {
      writeFileSync(file, JSON.stringify([scopeRows[0], ['huatai-finance-hk', '1', 'Branding video']], null, 2));
    } else {
      /* A frame that is not there is named in the sheet all the same — the
         frame that has gone missing is the one the run has to report. */
      writeFileSync(
        file,
        JSON.stringify(
          [
            galleryRows[0],
            ['huatai-finance-hk', '1', 'frame-that-is-not-there.jpg', 'A frame', 'A caption', 'true'],
          ],
          null,
          2,
        ),
      );
    }
  }

  /* The pictures. The missing one is simply not there. The others are a
     real picture, because the sync resizes them on the way in. */
  const media = join(directory, 'media', 'huatai-finance-hk');
  mkdirSync(media, { recursive: true });
  const real = join(ROOT, 'public', 'media', 'cases', 'huatai-finance-hk', 'case-huatai.jpg');
  if (!pictureMissing) {
    copyFileSync(real, join(media, 'case-huatai.jpg'));
  }
  if (!frameMissing) {
    copyFileSync(real, join(media, 'frame-that-is-not-there.jpg'));
  }
}

/**
 * A copy of the repository, just enough of it for the sync to run.
 *
 * The sync writes into the repository's own `content/cases/`, so it is run
 * in a copy — the real content is not touched by a test.
 */
function copyRepo(directory) {
  mkdirSync(join(directory, 'tools'), { recursive: true });
  cpSync(join(ROOT, 'tools', 'cms'), join(directory, 'tools', 'cms'), { recursive: true });
  cpSync(join(ROOT, 'content'), join(directory, 'content'), { recursive: true });
  cpSync(join(ROOT, 'public'), join(directory, 'public'), { recursive: true });
  /* The vocabulary — the sector and service keys the sheet is checked
     against — lives in the site's own data modules. */
  mkdirSync(join(directory, 'src', 'data'), { recursive: true });
  cpSync(join(ROOT, 'src', 'data', 'sectors.js'), join(directory, 'src', 'data', 'sectors.js'));
  cpSync(join(ROOT, 'src', 'data', 'services.js'), join(directory, 'src', 'data', 'services.js'));
  return join(directory, 'tools', 'cms', 'sync-cases.mjs');
}

/** The sync, in a copy of the repository. */
function runSync(directory, fixture, { dryRun = false } = {}) {
  const script = copyRepo(directory);
  const args = [script, '--fixtures', fixture];
  if (dryRun) args.push('--dry-run');
  return execFileSync('node', args, { encoding: 'utf8', env: { ...process.env } });
}

console.log('The sync, against a fixture of the sheet.\n');

const work = mkdtempSync(join(tmpdir(), 'migather-sync-'));

/* ── 1. The ordinary case ─────────────────────────────────────────────── */
{
  console.log('A sheet whose pictures are all there');
  const fixture = join(work, 'fixture-ok');
  buildFixture(fixture);

  const output = runSync(join(work, 'repo-ok'), fixture, { dryRun: true });
  check('it compiles', output.includes('compiled cleanly'), output.slice(-120));
  check('a dry run writes nothing', output.includes('nothing was written'), output.slice(-120));
}

/* ── 2. A picture that is not there ───────────────────────────────────── */
{
  console.log('\nA sheet that names a picture which is not in Drive');
  const fixture = join(work, 'fixture-missing');
  buildFixture(fixture, { pictureMissing: true });

  let output = '';
  let threw = false;
  try {
    output = runSync(join(work, 'repo-missing'), fixture);
  } catch (error) {
    threw = true;
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }

  check('it does not crash', !threw, output.slice(-200));
  check('it says the picture is missing', /is missing/.test(output), output.slice(-200));
  check('it says it keeps the picture it has', /keeps/.test(output), output.slice(-200));

  /* And the case still has a picture, with the mock-up flag that goes with
     it — generated artwork is never shown unlabelled. */
  const written = JSON.parse(
    readFileSync(join(work, 'repo-missing', 'content', 'cases', 'huatai-finance-hk.json'), 'utf8'),
  );
  check('the case still has a picture', Boolean(written.image?.src), JSON.stringify(written.image));
  check('the picture it keeps is the old one', /case-huatai\.jpg$/.test(written.image?.src ?? ''), written.image?.src);
  check('the mock-up flag still goes with it', written.image?.mockup === true, String(written.image?.mockup));
}

/* ── 3. The frames ────────────────────────────────────────────────────── */
{
  console.log('\nA sheet whose frames are all there');
  const fixture = join(work, 'fixture-frames');
  buildFixture(fixture);

  const repo = join(work, 'repo-frames');
  const output = runSync(repo, fixture);
  check('it compiles', output.includes('compiled cleanly'), output.slice(-200));

  const written = JSON.parse(
    readFileSync(join(repo, 'content', 'cases', 'huatai-finance-hk.json'), 'utf8'),
  );
  check('the case carries the frame', written.gallery?.length === 1, JSON.stringify(written.gallery));
  check(
    'the frame points at the file in the case folder',
    written.gallery?.[0]?.src === '/media/cases/huatai-finance-hk/frame-that-is-not-there.jpg',
    written.gallery?.[0]?.src,
  );
  check('the frame carries its alt text', written.gallery?.[0]?.alt?.en === 'Mock-up: A frame', JSON.stringify(written.gallery?.[0]?.alt));
  check('the frame carries its caption', written.gallery?.[0]?.caption?.en === 'A caption', JSON.stringify(written.gallery?.[0]?.caption));
  check('the frame carries the mock-up flag', written.gallery?.[0]?.mockup === true, String(written.gallery?.[0]?.mockup));

  /* The alt text is prefixed by the compiler, so a screen-reader user is
     told the picture is generated artwork. */
  check(
    'the alt text says it is a mock-up',
    String(written.gallery?.[0]?.alt?.en ?? '').startsWith('Mock-up: '),
    written.gallery?.[0]?.alt?.en,
  );

  /* And the file itself is in the repository, beside the banner. */
  check(
    'the frame was written into the repository',
    existsSync(join(repo, 'public', 'media', 'cases', 'huatai-finance-hk', 'frame-that-is-not-there.jpg')),
  );
}

/* ── 4. A frame that is not there ─────────────────────────────────────── */
{
  console.log('\nA sheet that names a frame which is not in Drive');
  const fixture = join(work, 'fixture-frame-missing');
  buildFixture(fixture, { frameMissing: true });

  const repo = join(work, 'repo-frame-missing');
  let output = '';
  let threw = false;
  try {
    output = runSync(repo, fixture);
  } catch (error) {
    threw = true;
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }

  check('it does not crash', !threw, output.slice(-200));
  check('it says the frame is not there', /frame .* is not in Drive/.test(output), output.slice(-200));

  const written = JSON.parse(
    readFileSync(join(repo, 'content', 'cases', 'huatai-finance-hk.json'), 'utf8'),
  );
  check('the frame is not on the page', (written.gallery ?? []).length === 0, JSON.stringify(written.gallery));
}

rmSync(work, { recursive: true, force: true });

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
