/** Tiny class-name joiner. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Format an ISO date as "18 Sep 2026". */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
