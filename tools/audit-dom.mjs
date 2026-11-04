/**
 * Behavioural DOM audit for the v3.0 site.
 *
 * The screenshot capture proves a page *renders*. It does not prove the
 * header turns solid on scroll, that the mobile drawer opens, that no page
 * scrolls sideways on a phone, or that every internal link lands on a real
 * page rather than the 404.
 *
 * This drives the real page in headless Chrome and asserts those things.
 *
 * Usage:  node tools/audit-dom.mjs [--width 1440] [--height 900]
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:4176';

/**
 * Ask the OS for a free port.
 *
 * A fixed port is a trap: two audits running at once — or one whose Chrome
 * has not been reaped yet — collide on it, and the second run silently
 * attaches to the first one's browser and reports nonsense. An ephemeral
 * port removes the class of failure.
 */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};

const WIDTH = Number(argOf('--width', 1440));
const HEIGHT = Number(argOf('--height', 900));
const PHONE = WIDTH < 700;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const failures = [];
const passes = [];

function check(label, ok, detail = '') {
  if (ok) passes.push(label);
  else failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail && !ok ? ` — ${detail}` : ''}`);
}

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
}

async function main() {
  const PORT = await freePort();

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${WIDTH},${HEIGHT}`,
      'about:blank',
    ],
    // Own process group, so the whole browser tree can be reaped at the end
    // rather than just the launcher.
    { stdio: 'ignore', detached: true },
  );

  let ws;
  try {
    for (let i = 0; i < 40; i += 1) {
      try {
        const info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
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

    const evaluate = async (expression) => {
      const res = await sessionSend('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.exception?.description ?? 'evaluate failed');
      }
      return res.result.value;
    };

    await sessionSend('Page.enable');
    await sessionSend('Runtime.enable');
    await sessionSend('Emulation.setDeviceMetricsOverride', {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: PHONE,
    });

    const goto = async (url) => {
      await sessionSend('Page.navigate', { url });
      await sleep(700);
      await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
      await sleep(250);
    };

    /* ── 1. The homepage ────────────────────────────────────────────── */
    await goto(`${BASE}/en?capture=1`);

    const overflow = await evaluate(
      'document.documentElement.scrollWidth - document.documentElement.clientWidth',
    );
    check(
      `no horizontal overflow at ${WIDTH}px`,
      overflow <= 1,
      `scrollWidth exceeds clientWidth by ${overflow}px`,
    );

    const blankImages = await evaluate(`
      JSON.stringify(
        Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute('src'))
      )
    `);
    check(
      'every image on the homepage loaded',
      JSON.parse(blankImages).length === 0,
      JSON.parse(blankImages).join(', '),
    );

    const heroIndex = await evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('.index-nav__number')).map((n) => n.textContent.trim())
      )
    `);
    check(
      'the hero index carries three numbers',
      JSON.parse(heroIndex).length === 3,
      `found ${JSON.parse(heroIndex).join(', ')}`,
    );

    const heroLinks = await evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('.index-nav__link')).map((a) => a.getAttribute('href'))
      )
    `);
    check(
      'the hero index points at three on-page anchors',
      JSON.parse(heroLinks).every((h) => h && h.startsWith('#')),
      JSON.parse(heroLinks).join(', '),
    );

    // The anchors must resolve to a real element.
    const anchorTargets = await evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('.index-nav__link')).map((a) => {
          const id = a.getAttribute('href').slice(1);
          return !!document.getElementById(id);
        })
      )
    `);
    check(
      'every hero index anchor resolves to a section',
      JSON.parse(anchorTargets).every(Boolean),
      JSON.parse(anchorTargets).join(', '),
    );

    /* ── 2. The header, before and after scroll ─────────────────────── */
    const headerBefore = await evaluate(`
      (() => {
        const h = document.querySelector('header');
        return getComputedStyle(h).backgroundColor;
      })()
    `);
    check(
      'the header is transparent over the hero',
      headerBefore === 'rgba(0, 0, 0, 0)' || headerBefore === 'transparent',
      `background-color is ${headerBefore}`,
    );

    await evaluate('window.scrollTo(0, 600)');
    await sleep(400);
    const headerAfter = await evaluate(`
      (() => {
        const h = document.querySelector('header');
        return getComputedStyle(h).backgroundColor;
      })()
    `);
    check(
      'the header turns solid after scrolling',
      headerAfter !== 'rgba(0, 0, 0, 0)' && headerAfter !== 'transparent',
      `background-color is ${headerAfter}`,
    );
    await evaluate('window.scrollTo(0, 0)');
    await sleep(300);

    /* ── 3. The mobile drawer ────────────────────────────────────────── */
    if (PHONE) {
      // Measured by geometry, not by the transform property: Tailwind v4's
      // `translate-x-*` utilities set the CSS `translate` property, so
      // `getComputedStyle().transform` stays `none` either way.
      const drawerBox = () =>
        evaluate(`
          (() => {
            const panel = document.querySelector('[role="dialog"]');
            if (!panel) return null;
            const r = panel.getBoundingClientRect();
            return { left: Math.round(r.left), right: Math.round(r.right), width: window.innerWidth };
          })()
        `);

      const closed = await drawerBox();
      check(
        'the mobile drawer starts closed, off-screen',
        closed !== null && closed.left >= closed.width - 1,
        `panel left is ${closed?.left}, viewport is ${closed?.width}`,
      );

      await evaluate(`
        (() => {
          const btn = document.querySelector('header button[aria-expanded]');
          btn.click();
        })()
      `);
      await sleep(600);

      const open = await drawerBox();
      check(
        'the mobile drawer opens on screen',
        open !== null && open.left < open.width - 40,
        `panel left is ${open?.left}, viewport is ${open?.width}`,
      );

      const drawerAfter = await evaluate(`
        (() => {
          const panel = document.querySelector('[role="dialog"]');
          const wrapper = panel?.parentElement;
          return {
            hidden: wrapper ? wrapper.getAttribute('aria-hidden') : 'no-wrapper',
            links: panel ? panel.querySelectorAll('a').length : 0,
          };
        })()
      `);
      check(
        'the opened drawer is exposed to assistive technology',
        drawerAfter.hidden === 'false',
        `aria-hidden is ${drawerAfter.hidden}`,
      );
      check(
        'the drawer contains navigation links',
        drawerAfter.links >= 5,
        `${drawerAfter.links} links`,
      );

      // Close it the way a reader does: the close button inside the
      // drawer. The header burger sits behind the overlay while the
      // drawer is open, so clicking it again is not a real user path.
      await evaluate(`
        (() => {
          const btn = document.querySelector('[role="dialog"] button');
          btn.click();
        })()
      `);
      await sleep(600);
      const reclosed = await drawerBox();
      check(
        'the mobile drawer closes again',
        reclosed !== null && reclosed.left >= reclosed.width - 1,
        `panel left is ${reclosed?.left}, viewport is ${reclosed?.width}`,
      );
    } else {
      const navLinks = await evaluate(`
        document.querySelectorAll('header nav a').length
      `);
      check('the desktop header carries the primary nav', navLinks >= 4, `${navLinks} links`);
    }

    /* ── 4. Every internal link resolves to a real page ─────────────── */
    const routes = ['/en', '/en/work', '/en/capabilities', '/en/about', '/en/careers', '/en/contact'];
    for (const route of routes) {
      await goto(`${BASE}${route}?capture=1`);
      const result = await evaluate(`
        (() => {
          const h1 = document.querySelector('main h1');
          const links = Array.from(document.querySelectorAll('main a[href]'))
            .map((a) => a.getAttribute('href'))
            .filter((h) => h && !h.startsWith('#') && !h.startsWith('http') && !h.startsWith('mailto'));
          return {
            h1: h1 ? h1.textContent.trim().slice(0, 40) : null,
            notFound: !!document.body.textContent.includes('This page is not here'),
            brokenImages: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).length,
            links: Array.from(new Set(links)),
          };
        })()
      `);
      check(`${route} renders its own heading`, !!result.h1 && !result.notFound, `h1: ${result.h1}`);
      check(`${route} has no broken images`, result.brokenImages === 0, `${result.brokenImages} broken`);
    }

    /* ── 5. The mock-up disclosure is present on every page ─────────── */
    await goto(`${BASE}/en?capture=1`);
    const footerDisclosure = await evaluate(`
      document.querySelector('footer').textContent.includes('Mock-up imagery')
    `);
    check('the footer carries the mock-up disclosure', footerDisclosure === true);

    const taggedImages = await evaluate(`
      Array.from(document.images).filter((img) => {
        const wrap = img.closest('.frame');
        return wrap && wrap.querySelector('span');
      }).length
    `);
    check('the homepage case images are tagged', taggedImages >= 3, `${taggedImages} tagged`);

    await goto(`${BASE}/en/work?capture=1`);
    const workTagged = await evaluate(`
      Array.from(document.querySelectorAll('.frame')).filter((f) => f.querySelector('span')).length
    `);
    check(
      'every work-grid image is tagged as a mock-up',
      workTagged === 16,
      `${workTagged} of 16 tagged`,
    );

    /* Every full-bleed banner — the homepage hero and every inner-page
       banner — is generated artwork, so it must carry the tag too. */
    for (const route of ['/en', '/en/work', '/en/about', '/en/capabilities', '/en/careers', '/en/contact']) {
      await goto(`${BASE}${route}?capture=1`);
      const bannerTagged = await evaluate(`
        (() => {
          const h1 = document.querySelector('main h1');
          if (!h1) return false;
          const section = h1.closest('section');
          if (!section) return false;
          return Array.from(section.querySelectorAll('span')).some(
            (s) => s.textContent.trim() === 'Mock-up'
          );
        })()
      `);
      check(`${route} labels its banner as a mock-up`, bannerTagged === true);
    }

    /* ── 5b. The language switcher ───────────────────────────────────── */
    /* A protocol-relative href ("//en") would resolve against the wrong
       host the moment the site leaves localhost, so the switcher must emit
       plain absolute paths — and it must keep the reader on the same page
       when they change language. */
    await goto(`${BASE}/en/work?capture=1`);
    const localeLinks = await evaluate(`
      Array.from(document.querySelectorAll('header nav a[hreflang]')).map((a) => a.getAttribute('href'))
    `);
    const uniqueLocales = [...new Set(localeLinks ?? [])].sort();
    check(
      'the language switcher links to plain absolute paths',
      Array.isArray(localeLinks) &&
        localeLinks.length >= 3 &&
        localeLinks.every((h) => /^\/(en|zh-Hant|zh-Hans)(\/.*)?$/.test(h)),
      JSON.stringify(localeLinks),
    );
    check(
      'the language switcher keeps the reader on the same page',
      JSON.stringify(uniqueLocales) ===
        JSON.stringify(['/en/work', '/zh-Hans/work', '/zh-Hant/work']),
      JSON.stringify(uniqueLocales),
    );

    /* ── 5c. The hero index ─────────────────────────────────────────── */
    /* The 01/02/03 index is the homepage table of contents. Each entry must
       point at a section that exists, scroll to it, and — because the header
       is fixed — land clear of the header rather than behind it. */
    await goto(`${BASE}/en`);
    const heroIndexCheck = await evaluate(`
      (async () => {
        const links = Array.from(document.querySelectorAll('a.index-nav__link'));
        const hrefs = links.map((a) => a.getAttribute('href'));
        const targetsExist = hrefs.every((h) => h && document.querySelector(h));
        const scrolls = [];
        for (const a of links) {
          const id = a.getAttribute('href');
          window.scrollTo(0, 0);
          await new Promise((r) => setTimeout(r, 400));
          const before = window.scrollY;
          a.click();
          await new Promise((r) => setTimeout(r, 1200));
          const el = document.querySelector(id);
          const rect = el.getBoundingClientRect();
          scrolls.push({
            id,
            moved: window.scrollY > before,
            top: Math.round(rect.top),
            clearOfHeader: rect.top >= 60,
          });
        }
        return { count: links.length, hrefs, targetsExist, scrolls };
      })()
    `);
    check(
      'the hero index points at real sections',
      heroIndexCheck.count === 3 &&
        heroIndexCheck.targetsExist === true &&
        JSON.stringify(heroIndexCheck.hrefs) === JSON.stringify(['#work', '#approach', '#contact']),
      JSON.stringify(heroIndexCheck.hrefs),
    );
    check(
      'every hero index entry scrolls to its section',
      Array.isArray(heroIndexCheck.scrolls) &&
        heroIndexCheck.scrolls.length === 3 &&
        heroIndexCheck.scrolls.every((s) => s.moved),
      JSON.stringify(heroIndexCheck.scrolls),
    );
    check(
      'every hero index entry lands clear of the fixed header',
      Array.isArray(heroIndexCheck.scrolls) &&
        heroIndexCheck.scrolls.length === 3 &&
        heroIndexCheck.scrolls.every((s) => s.clearOfHeader),
      JSON.stringify(heroIndexCheck.scrolls),
    );

    /* ── 6. The sector filter ────────────────────────────────────────── */
    await goto(`${BASE}/en/work?capture=1`);
    const filterResult = await evaluate(`
      (async () => {
        const buttons = Array.from(document.querySelectorAll('.filter-row__item'));
        const target = buttons.find((b) => b.textContent.includes('Finance'));
        target.click();
        await new Promise((r) => setTimeout(r, 400));
        return {
          pressed: target.getAttribute('aria-pressed'),
          url: location.search,
          cards: document.querySelectorAll('.frame').length,
        };
      })()
    `);
    check(
      'the sector filter sets its state',
      filterResult.pressed === 'true',
      `aria-pressed is ${filterResult.pressed}`,
    );
    check(
      'the sector filter is held in the URL',
      filterResult.url.includes('filter=finance'),
      `search is ${filterResult.url}`,
    );
    check(
      'the sector filter narrows the grid',
      filterResult.cards > 0 && filterResult.cards < 16,
      `${filterResult.cards} cards`,
    );

    /* ── 7. The work grid loads the way a reader loads it ─────────────
       Deliberately WITHOUT `?capture=1`: capture mode promotes lazy
       images to eager, which would hide a broken lazy-loading path.
       This is the real first-visit behaviour. */
    await goto(`${BASE}/en/work`);
    await evaluate('window.scrollTo(0, 2200)');
    await sleep(1500);
    const gridImages = await evaluate(`
      (() => {
        const imgs = Array.from(document.querySelectorAll('.frame img'));
        return {
          total: imgs.length,
          loaded: imgs.filter((i) => i.naturalWidth > 0).length,
          withSrc: imgs.filter((i) => i.getAttribute('src')).length,
        };
      })()
    `);
    check(
      'every work-grid image loads when scrolled into view',
      gridImages.total === 16 && gridImages.loaded === 16,
      `${gridImages.loaded} of ${gridImages.total} loaded`,
    );
    check(
      'every work-grid image has a source',
      gridImages.withSrc === gridImages.total,
      `${gridImages.withSrc} of ${gridImages.total} have a src`,
    );

    // Scroll the rest of the grid in and confirm nothing stays blank.
    await evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await sleep(1500);
    const allLoaded = await evaluate(`
      (() => {
        const imgs = Array.from(document.querySelectorAll('.frame img'));
        return imgs.filter((i) => i.naturalWidth > 0).length;
      })()
    `);
    check(
      'every work-grid image is loaded after scrolling the whole grid',
      allLoaded === 16,
      `${allLoaded} of 16 loaded`,
    );
  } finally {
    // Reap the whole browser tree, not just the launcher, and wait for the
    // port to actually come free. A leftover headless Chrome is what makes
    // the next run attach to the wrong browser.
    try {
      process.kill(-chrome.pid, 'SIGKILL');
    } catch {
      chrome.kill('SIGKILL');
    }
    for (let i = 0; i < 40; i += 1) {
      const stillUp = await fetch(`http://127.0.0.1:${PORT}/json/version`)
        .then(() => true)
        .catch(() => false);
      if (!stillUp) break;
      await sleep(150);
    }
  }

  console.log(`\n${passes.length} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  · ${f}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
