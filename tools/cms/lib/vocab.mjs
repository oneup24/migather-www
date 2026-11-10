/**
 * The vocabulary the sheet is checked against.
 *
 * The sector list and the service keys are the site's own taxonomy, read
 * from the data modules rather than copied into the CMS. One list, two
 * places: a key the CMS accepts is a key the site renders, and a key the
 * site renders is a key the CMS accepts.
 *
 * The sector list lives in `src/data/sectors.js` rather than in
 * `src/data/cases.js` because this file is read by plain Node — the case
 * loader itself is built by Vite and cannot be imported outside the bundler.
 */
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DATA_DIR = join(ROOT, 'src', 'data');

const { sectors } = await import(join(DATA_DIR, 'sectors.js'));
const { allServices } = await import(join(DATA_DIR, 'services.js'));

/** The sector keys a case may carry. */
export const SECTOR_KEYS = Object.keys(sectors);

/** The service keys a case may carry — the 25 lines of the service menu. */
export const SERVICE_KEYS = allServices.map((service) => service.key);

/** The service keys, with their names, for a dropdown or a menu. */
export const SERVICE_MENU = allServices.map((service) => ({
  key: service.key,
  name: service.name,
  group: service.group,
}));

/** The sector keys, with their names. */
export const SECTOR_MENU = Object.entries(sectors).map(([key, value]) => ({
  key,
  label: value.label,
}));
