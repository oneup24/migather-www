/**
 * Tighten the viewBox of the client marks.
 *
 * Logos pulled off the web are often drawn inside a canvas that is much
 * larger than the mark itself — a header strip, a 480-pixel placeholder,
 * a wide sheet with the logo in one corner. Scaled to a 36-pixel cell, the
 * mark then renders as a speck.
 *
 * This opens every vector mark in headless Chrome, asks the browser for the
 * tight bounding box of its contents, and rewrites the viewBox (and the
 * width and height) to match. The mark stays a vector; only the frame
 * around it is removed.
 *
 * Usage:  node tools/media/tighten-client-logos.mjs
 */
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIR = join(ROOT, 'public', 'media', 'clients');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9347;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.svg'));
  if (!files.length) return;

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let wsUrl;
  try {
    for (let i = 0; i < 40; i += 1) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        wsUrl = (await res.json()).webSocketDebuggerUrl;
        break;
      } catch {
        await sleep(250);
      }
    }
    if (!wsUrl) throw new Error('Chrome did not expose a debugging endpoint');

    const { WebSocket } = await import('ws').catch(() => ({ WebSocket: globalThis.WebSocket }));
    const socket = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve);
      socket.addEventListener('error', reject);
    });

    const cdp = new CDP(socket);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);

    for (const file of files) {
      const path = join(DIR, file);
      const svg = readFileSync(path, 'utf8');
      const html = `<!doctype html><meta charset="utf-8"><body style="margin:0">${svg}</body>`;

      await cdp.send(
        'Page.navigate',
        { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` },
        sessionId,
      );
      await sleep(350);

      const { result } = await cdp.send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            const svg = document.querySelector('svg');
            if (!svg) return null;
            let b;
            try { b = svg.getBBox(); } catch (e) { return null; }
            if (!b || !b.width || !b.height) return null;
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          })()`,
          returnByValue: true,
        },
        sessionId,
      );

      const box = result?.value;
      if (!box) {
        console.log(`${file.padEnd(28)} could not measure`);
        continue;
      }

      const pad = Math.max(box.width, box.height) * 0.02;
      const x = box.x - pad;
      const y = box.y - pad;
      const w = box.width + pad * 2;
      const h = box.height + pad * 2;

      let out = svg.replace(/viewBox="[^"]*"/, `viewBox="${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}"`);
      out = out.replace(/(<svg[^>]*?)\swidth="[^"]*"/, `$1 width="${w.toFixed(0)}"`);
      out = out.replace(/(<svg[^>]*?)\sheight="[^"]*"/, `$1 height="${h.toFixed(0)}"`);
      writeFileSync(path, out);
      console.log(`${file.padEnd(28)} ${w.toFixed(0)} x ${h.toFixed(0)}`);
    }

    socket.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
