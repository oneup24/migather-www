/**
 * Copy compliance screen.
 *
 * Scans every translatable string for:
 *   1. 中国广告法 restricted terms — 国家级、世界级、最高级、顶级、第一、唯一、
 *      一流、首选、首家、首要、高级 (and their Traditional forms)
 *   2. Migather's own banned-claim words — leading · global agency ·
 *      award-winning · top · No.1 · full-service · end-to-end solutions ·
 *      industry leader
 *
 * Two places are scanned:
 *   · `src/data/*.js` — the hand-edited data modules.
 *   · `content/cases/*.json` — the compiled case files, which the CMS
 *     writes. The case copy is published from there, so it is screened
 *     there: a banned term typed into the form has to fail the build
 *     before the case is published, not after.
 *
 * The word lists live in `compliance-lists.mjs`, shared with the rendered-copy
 * screen in `ssr-check.jsx` so the two cannot drift apart.
 *
 * The English list is checked case-insensitively on word boundaries. Hits
 * are reported with the file and the surrounding string so each can be
 * judged — some are legitimate (a client's name, a quoted word) and can be
 * allow-listed in ALLOW.
 *
 * Run with:  npm run check:copy
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOW, CN_BANNED, EN_BANNED } from './compliance-lists.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DATA_DIR = join(ROOT, 'src', 'data');
const CONTENT_DIR = join(ROOT, 'content', 'cases');

/** Pull the string literals out of a JS data module, ignoring comments. */
function extractStrings(source) {
  // Strip block and line comments first, so documentation that merely lists
  // the banned words is not mistaken for copy that uses them.
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const value = m[1] ?? m[2] ?? m[3] ?? '';
    if (value.trim().length > 0) out.push({ value, index: m.index });
  }
  return out;
}

/**
 * Walk a parsed JSON file and collect every string it holds.
 *
 * The path is kept so a hit can be traced to the field it came from —
 * `summary.zh-Hans`, `results[1].label.en`, `scope[3].text` — which is what
 * makes a hit in a compiled case file actionable.
 */
function extractJsonStrings(value, path = '', out = []) {
  if (typeof value === 'string') {
    if (value.trim().length > 0) out.push({ value, where: path || '(root)' });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractJsonStrings(item, `${path}[${index}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      extractJsonStrings(child, path ? `${path}.${key}` : key, out);
    }
    return out;
  }
  return out;
}

let hits = 0;
let checked = 0;

/** Screen one string, reporting where it came from. */
function screen(value, where) {
  if (ALLOW.some((a) => value.includes(a.match))) return;

  for (const term of CN_BANNED) {
    if (value.includes(term)) {
      hits += 1;
      console.log(`CN  ${where}  contains "${term}"`);
      console.log(`    ${value.slice(0, 120)}`);
    }
  }

  const lower = value.toLowerCase();
  for (const term of EN_BANNED) {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`,
      'i',
    );
    if (!pattern.test(lower)) continue;
    hits += 1;
    console.log(`EN  ${where}  contains "${term}"`);
    console.log(`    ${value.slice(0, 120)}`);
  }
}

/* ── The hand-edited data modules ─────────────────────────────────────── */
const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.js'));

for (const file of files) {
  const source = readFileSync(join(DATA_DIR, file), 'utf8');
  const strings = extractStrings(source);

  for (const { value, index } of strings) {
    checked += 1;
    const line = source.slice(0, index).split('\n').length;
    screen(value, `${file}:${line}`);
  }
}

/* ── The compiled case files ──────────────────────────────────────────── */
let caseFiles = [];
try {
  caseFiles = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
} catch {
  caseFiles = [];
}

for (const file of caseFiles) {
  const source = readFileSync(join(CONTENT_DIR, file), 'utf8');
  const parsed = JSON.parse(source);

  for (const { value, where } of extractJsonStrings(parsed)) {
    checked += 1;
    screen(value, `${file} ${where}`);
  }
}

if (hits === 0) {
  console.log(
    `Copy screen clean — ${files.length} data modules and ${caseFiles.length} compiled case files checked against the banned-word lists.`,
  );
  process.exit(0);
}

console.log(`\n${hits} flagged string(s). Review each and either reword or add to ALLOW.`);
process.exit(1);
