import { banners } from '../data/media';
import V3Cta from '../components/v3/V3Cta';
import V3Hero from '../components/v3/V3Hero';
import V3LogoWall from '../components/v3/V3LogoWall';
import V3Principles from '../components/v3/V3Principles';
import V3Stats from '../components/v3/V3Stats';

/**
 * The homepage.
 *
 * The order was reset by management in November 2026:
 *
 *   1. Hero — the claim, the picked-out phrase, the page index.
 *   2. Who we work with — the client wall, moved up from the foot.
 *   3. How we work — the principles, moved up from fourth.
 *   4. By the numbers — the four countable facts.
 *   5. Next step — the closing call to action.
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

      <V3LogoWall />
      <V3Principles />
      <V3Stats />
      <V3Cta />
    </>
  );
}
