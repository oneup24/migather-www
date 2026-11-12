/**
 * The mocked editor, in the dev server.
 *
 * The works editor signs in with Google, and Google's OAuth client only
 * accepts the origins it was told about — `https://oneup24.github.io` and
 * `https://migather.com`. On `localhost` the sign-in therefore fails with
 * `origin_mismatch`, before anything of ours has run.
 *
 * That is a Google Console setting, not a code problem, and it should not
 * stand between an editor and the form. So when `VITE_CMS_MOCK=1` is set,
 * the dev server injects the same mock the preview tool uses: the sheet is
 * the real compiled content, the sign-in is granted, and the picture and the
 * publish are recorded rather than performed.
 *
 * Nothing is written anywhere, and the published build is never affected —
 * the plugin only ever runs in the dev server.
 *
 * Usage:
 *   npm run dev:editor      # the site, with the editor mocked
 *   npm run dev              # the site, with the real editor
 */
import { buildFixture, mockScript } from './lib/mock-google.js';

/**
 * The plugin.
 *
 * It rewrites the dev server's HTML on the way out, so the mock is in the
 * page before the app's own scripts run.
 */
export function mockEditor() {
  const enabled = process.env.VITE_CMS_MOCK === '1';

  return {
    name: 'migather:mock-editor',

    apply: 'serve',

    transformIndexHtml(html) {
      if (!enabled) return html;

      const { tabs } = buildFixture();
      const mock = mockScript(tabs);

      return {
        html,
        tags: [
          {
            tag: 'script',
            children: mock,
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}
