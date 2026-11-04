import { Link } from 'react-router-dom';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Icon from '../ui/Icon';

/**
 * The closing call to action.
 *
 * One claim, one rule, one button — the GAIA discipline of a single
 * statement rather than a menu of next steps.
 */
export default function V3Cta() {
  const { t, path } = useLocale();
  const cta = content.home.cta;

  return (
    <section id="contact" className="scroll-mt-24 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="editorial">
          <div className="editorial-label">{t(contentV3.labels.nextStep)}</div>

          <div>
            <h2 className="editorial-statement editorial-statement--lg max-w-[16ch]">
              {t(cta.title)}
            </h2>

            <div aria-hidden="true" className="mt-10 h-[3px] w-16 bg-brandCrimson" />

            <p className="editorial-lede mt-9">{t(cta.lede)}</p>

            <Link
              to={path('/contact')}
              className="mt-10 inline-flex items-center gap-2 bg-brandBlue px-8 py-4 font-display text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-brandBlueDeep"
            >
              {t(cta.button)}
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
