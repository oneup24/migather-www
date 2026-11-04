/**
 * Icon set. Every glyph inherits `currentColor` so accent tinting is done
 * with a Tailwind text-* class on the wrapper.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠ Fixed in v3.0 — the same defect was in v1.0 and v2.0.
 *
 * This component used to put the path data straight into the DOM with no
 * `<svg>` element around it, and carried `viewBox` on the path itself.
 * A `<path>` outside an `<svg>` is an unknown HTML element and renders
 * nothing at all — so every icon on the site (the mobile menu button, the
 * close button, every arrow) was invisible. The glyph geometry was always
 * correct; only the wrapper was missing.
 * ─────────────────────────────────────────────────────────────────────────
 */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 2,
};

const PATHS = {
  square: (
    <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" stroke="none" />
  ),
  chart: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" {...strokeProps} />,
  ring: (
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="4" />
  ),
  monitor: (
    <path
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      {...strokeProps}
    />
  ),
  megaphone: (
    <path
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      {...strokeProps}
    />
  ),
  'arrow-right': <path d="M5 12h14m0 0l-6-6m6 6l-6 6" {...strokeProps} />,
  'arrow-up-right': <path d="M7 17L17 7m0 0h-8m8 0v8" {...strokeProps} />,
  check: <path d="M5 13l4 4L19 7" {...strokeProps} />,
  mail: (
    <path
      d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 1l9 6 9-6"
      {...strokeProps}
    />
  ),
  calendar: (
    <path
      d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
      {...strokeProps}
    />
  ),
  spark: (
    <path
      d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"
      {...strokeProps}
    />
  ),
  close: <path d="M6 6l12 12M18 6L6 18" {...strokeProps} />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" {...strokeProps} />,
  'chevron-down': <path d="M6 9l6 6 6-6" {...strokeProps} />,
  twitter: (
    <path
      fill="currentColor"
      stroke="none"
      d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
    />
  ),
  linkedin: (
    <path
      fill="currentColor"
      stroke="none"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    />
  ),
};

export default function Icon({ name, className = 'w-5 h-5' }) {
  const glyph = PATHS[name];
  if (!glyph) return null;

  return (
    <svg
      className={`inline-flex shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
