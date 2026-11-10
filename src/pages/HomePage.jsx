import { banners } from '../data/media';
import V3Cta from '../components/v3/V3Cta';
import V3Hero from '../components/v3/V3Hero';
import V3LogoWall from '../components/v3/V3LogoWall';
import V3Principles from '../components/v3/V3Principles';

/**
 * The homepage.
 *
 * The order was reset by management in November 2026:
 *
 *   1. Hero — the claim, the picked-out phrase, the page index.
 *   2. How we work — the principles, moved up to sit under the hero.
 *   3. Who we work with — the client wall and the four figures.
 *   4. Next step — the closing call to action.
 *
 * The "In their words" section and the full "Who we work with" editorial
 * were removed; the testimonials now live on the About page, where they
 * were always meant to sit. The selected work was removed from the
 * homepage in November 2026 as well — the work has its own page, and the
 * hero index now points there.
 */
export default function HomePage() {
  return (
    <>
      <V3Hero image={banners.home} />

      <V3Principles />
      <V3LogoWall />
      <V3Cta />
    </>
  );
}
