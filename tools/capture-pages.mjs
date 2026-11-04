/**
 * Full-page mock-up capture for the v3.0 site.
 *
 * Renders every route in every locale in headless Chrome over CDP and
 * writes a full-page PNG per route. The site is opened with `?capture=1`
 * so scroll-revealed content is in its final state and no section comes
 * out blank.
 *
 * Output:  docs/mockups/<locale>/<slug>.png
 *
 * Usage:  node tools/capture-pages.mjs [--locale en] [--width 1440]
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT_ROOT = join(ROOT, 'docs', 'mockups');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9341;
const BASE = 'http://localhost:4176';
const TIMEOUT = 60_000;

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};

const WIDTH = Number(argOf('--width', 1440));
const HEIGHT = Number(argOf('--height', 900));
const SCALE = Number(argOf('--scale', 2));
const ONLY_LOCALE = argOf('--locale', null);
const OUT_TAG = argOf('--out', null);

/** Every page in the route table, in the order a reader meets them. */
const ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'work', path: '/work' },
  { slug: 'work-huatai', path: '/work/huatai-finance-hk' },
  { slug: 'work-christies', path: '/work/christies-auction' },
  { slug: 'capabilities', path: '/capabilities' },
  { slug: 'about', path: '/about' },
  { slug: 'careers', path: '/careers' },
  { slug: 'contact', path: '/contact' },
  { slug: 'legal-privacy', path: '/legal/privacy' },
  { slug: 'not-found', path: '/this-route-does-not-exist' },
];

const LOCALES = ONLY_LOCALE ? [ONLY_LOCALE] : ['en', 'zh-Hant', 'zh-Hans'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
        return;
      }
      (this.events.get(msg.method) ?? []).forEach((fn) => fn(msg.params));
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method, timeout = TIMEOUT) {
    return new Promise((resolve) => {
      const fn = (params) => {
        this.events.get(method).splice(this.events.get(method).indexOf(fn), 1);
        resolve(params);
      };
      this.events.set(method, [...(this.events.get(method) ?? []), fn]);
      setTimeout(() => resolve(null), timeout);
    });
  }
}

async function main() {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`,
      `--window-size=${WIDTH},${HEIGHT}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let ws;
  try {
    for (let i = 0; i < 40; i += 1) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        const info = await res.json();
        ws = info.webSocketDebuggerUrl;
        break;
      } catch {
        await sleep(250);
      }
    }
    if (!ws) throw new Error('Chrome did not expose a debugging endpoint');

    const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
    const socket = new WebSocket(ws);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve);
      socket.addEventListener('error', reject);
    });

    const cdp = new CDP(socket);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    const sessionSend = (method, params = {}) => {
      const id = ++cdp.id;
      return new Promise((resolve, reject) => {
        cdp.pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    };

    await sessionSend('Page.enable');
    await sessionSend('Emulation.setDeviceMetricsOverride', {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: SCALE,
      mobile: false,
    });

    const results = [];

    const OUT = OUT_TAG ? join(OUT_ROOT, OUT_TAG) : OUT_ROOT;

    for (const locale of LOCALES) {
      const dir = join(OUT, locale);
      mkdirSync(dir, { recursive: true });

      for (const route of ROUTES) {
        const url = `${BASE}/${locale}${route.path === '/' ? '' : route.path}?capture=1`;
        await sessionSend('Page.navigate', { url });

        // Wait for the load event, then for fonts, then scroll the whole
        // page so every lazy image is genuinely requested, then wait for
        // each image to finish decoding. A lazy image that has never
        // entered the viewport renders as an empty frame, which would
        // ship a blank mock-up.
        await sessionSend('Runtime.evaluate', {
          expression: `
            (async () => {
              if (document.fonts) await document.fonts.ready;

              const step = Math.round(window.innerHeight * 0.8);
              for (let y = 0; y < document.body.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise((r) => setTimeout(r, 120));
              }
              window.scrollTo(0, 0);
              await new Promise((r) => setTimeout(r, 120));

              const imgs = Array.from(document.images);
              await Promise.all(
                imgs.map((img) =>
                  img.complete
                    ? Promise.resolve()
                    : new Promise((res) => {
                        img.addEventListener('load', res, { once: true });
                        img.addEventListener('error', res, { once: true });
                      }),
                ),
              );
              await Promise.all(
                imgs.map((img) => (img.decode ? img.decode().catch(() => {}) : null)),
              );
              if (document.readyState !== 'complete') {
                await new Promise((res) =>
                  window.addEventListener('load', res, { once: true }),
                );
              }
              return imgs.length;
            })()
          `,
          awaitPromise: true,
        });
        await sleep(600);

        // Fail loudly rather than shipping a blank mock-up: any image that
        // decoded to zero natural width never loaded.
        const broken = await sessionSend('Runtime.evaluate', {
          expression: `
            JSON.stringify(
              Array.from(document.images)
                .filter((img) => !img.complete || img.naturalWidth === 0)
                .map((img) => img.getAttribute('src') || '(no src)'),
            )
          `,
          returnByValue: true,
        });
        const brokenList = JSON.parse(broken.result.value ?? '[]');
        if (brokenList.length) {
          throw new Error(
            `${route.slug}: ${brokenList.length} image(s) did not load — ${brokenList.join(', ')}`,
          );
        }

        const shot = await sessionSend('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: true,
          optimizeForSpeed: false,
        });

        const file = join(dir, `${route.slug}.png`);
        writeFileSync(file, Buffer.from(shot.data, 'base64'));

        const { cssContentSize } = await sessionSend('Page.getLayoutMetrics');
        results.push({
          locale,
          slug: route.slug,
          path: route.path,
          file,
          height: Math.round(cssContentSize.height),
        });
        console.log(`${locale.padEnd(8)} ${route.slug.padEnd(18)} ${Math.round(cssContentSize.height)}px`);
      }
    }

    writeFileSync(join(OUT, 'capture-log.json'), JSON.stringify(results, null, 2));
    console.log(`\n${results.length} screens written to ${OUT}`);
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
