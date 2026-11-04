/**
 * Copy compliance screen.
 *
 * Scans every translatable string in `src/data/` for:
 *   1. 中国广告法 restricted terms — 国家级、世界级、最高级、顶级、第一、唯一、
 *      一流、首选、首家、首要、高级 (and their Traditional forms)
 *   2. Migather's own banned-claim words — leading · global agency ·
 *      award-winning · top · No.1 · full-service · end-to-end solutions ·
 *      industry leader
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

const DATA_DIR = fileURLToPath(new URL('../src/data/', import.meta.url));

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

let hits = 0;
const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.js'));

for (const file of files) {
  const source = readFileSync(join(DATA_DIR, file), 'utf8');
  const strings = extractStrings(source);

  for (const { value, index } of strings) {
    if (ALLOW.some((a) => value.includes(a.match))) continue;

    const line = source.slice(0, index).split('\n').length;

    for (const term of CN_BANNED) {
      if (value.includes(term)) {
        hits += 1;
        console.log(`CN  ${file}:${line}  contains "${term}"`);
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
      console.log(`EN  ${file}:${line}  contains "${term}"`);
      console.log(`    ${value.slice(0, 120)}`);
    }
  }
}

if (hits === 0) {
  console.log(`Copy screen clean — ${files.length} data modules checked against the banned-word lists.`);
  process.exit(0);
}

console.log(`\n${hits} flagged string(s). Review each and either reword or add to ALLOW.`);
process.exit(1);
