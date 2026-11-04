import { banners } from '../data/media';
import V3Clients from '../components/v3/V3Clients';
import V3Cta from '../components/v3/V3Cta';
import V3Hero from '../components/v3/V3Hero';
import V3Marquee from '../components/v3/V3Marquee';
import V3Principles from '../components/v3/V3Principles';
import V3Stats from '../components/v3/V3Stats';
import V3Voices from '../components/v3/V3Voices';
import V3WorkSection from '../components/v3/V3WorkSection';

/**
 * The homepage.
 *
 * The order follows Capsule48's: a claim, then the body in editorial rows,
 * then the work, then the proof. GAIA's numbered index at the foot of the
 * hero points at the three sections that matter.
 */
export default function HomePage() {
  return (
    <>
      <V3Hero image={banners.home} />

      <V3Clients />
      <V3WorkSection />
      <V3Principles />
      <V3Stats />
      <V3Marquee />
      <V3Voices />
      <V3Cta />
    </>
  );
}
