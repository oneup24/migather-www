import { Link } from 'react-router-dom';
import { cases } from '../../data/cases';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Icon from '../ui/Icon';
import Editorial from './Editorial';
import V3WorkGrid from './V3WorkGrid';

/**
 * Selected work.
 *
 * Three cases, chosen to span sectors rather than to be the three biggest —
 * finance, property and auction — so the grid reads as a range and not as
 * one speciality. Every figure shown is sourced from a credential deck.
 */
export default function V3WorkSection() {
  const { t, path } = useLocale();
  const work = content.home.work;

  const selected = contentV3.featuredCases
    .map((slug) => cases.find((entry) => entry.slug === slug))
    .filter(Boolean);

  return (
    <section id="work" className="scroll-mt-24 bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Editorial
          label={t(contentV3.labels.work)}
          statement={t(work.title)}
          lede={t(work.lede)}
        />

        <div className="mt-16">
          <V3WorkGrid entries={selected} columns={3} />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-9">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-muted">
            {t(contentV3.disclosure.workNote)}
          </p>

          <Link to={path('/work')} className="link-line shrink-0">
            {t(contentV3.labels.allWork)}
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
