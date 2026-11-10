/**
 * A preview of the works editor, without Google.
 *
 * The editor page is a page of the website, so the honest way to look at
 * it is in the website — with the sheet behind it mocked, so it can be
 * opened without a Google account, a sheet, or a build.
 *
 * It serves the built app with the mock injected. The sign-in is granted
 * automatically, so the page opens straight into the form; the sheet is the
 * real compiled content; and the picture and the publish are recorded
 * rather than performed.
 *
 * Usage:
 *   npm run cms:preview
 *
 * Then open the printed URL and go to /en/admin.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';

import { buildFixture, mockScript } from './lib/mock-google.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST = join(ROOT, 'dist');

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const index = argv.indexOf(flag);
  return index === -1 ? fallback : argv[index + 1];
};
const PORT = Number(argOf('--port', 4180));

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('there is no build to preview — run `npm run build` first');
  process.exit(1);
}

const { tabs } = buildFixture();
const mock = mockScript(tabs);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);
  let path = decodeURIComponent(url.pathname);

  /* Every path serves the app — it is a single-page app. */
  let file = join(DIST, path);
  if (!existsSync(file) || extname(file) === '') file = join(DIST, 'index.html');

  const type = TYPES[extname(file)] ?? 'application/octet-stream';

  if (file.endsWith('index.html')) {
    const html = readFileSync(file, 'utf8').replace(
      '</head>',
      `<script>${mock}</script></head>`,
    );
    response.writeHead(200, { 'Content-Type': type });
    response.end(html);
    return;
  }

  response.writeHead(200, { 'Content-Type': type });
  response.end(readFileSync(file));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`The works editor, with the sheet mocked:\n  http://localhost:${PORT}/en/admin\n`);
  console.log('The sign-in is granted for you. The sheet is the real compiled content.');
  console.log('Nothing is saved anywhere — the picture and the publish are only recorded.');
});
