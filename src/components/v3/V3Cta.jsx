import { Link } from 'react-router-dom';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import Icon from '../ui/Icon';

/**
 * The closing call to action.
 *
 * Rebuilt in November 2026. The old section was a claim and a button; this
 * one is a claim, a button, and the three things an enquiry has to carry —
 * objective, market, deadline, which are the three the contact form asks
 * for.
 *
 * The composition is the Capsule48 body grammar used one last time: a
 * small caps label with a crimson rule, the statement set large in the
 * editorial serif against the running copy, and a hairline closing the band
 * under the last row.
 */
export default function V3Cta() {
  const { t, path } = useLocale();
  const cta = content.home.cta;

  return (
    <section id="contact" className="scroll-mt-24 bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-brandCrimson/60" />
          <span className="eyebrow text-ink">{t(contentV3.labels.nextStep)}</span>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 className="editorial-statement editorial-statement--lg lg:col-span-6 max-w-[14ch]">
            {t(cta.title)}
          </h2>

          <div className="lg:col-span-5 lg:col-start-8">
            <p className="editorial-lede">{t(cta.lede)}</p>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link
                to={path('/contact')}
                className="inline-flex items-center gap-2 bg-brandBlue px-8 py-4 font-display text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-brandBlueDeep"
              >
                {t(cta.button)}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>

              <Link to={path('/work')} className="link-line">
                {t(content.home.hero.primaryCta)}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-rule pt-10">
          <div className="eyebrow text-muted">{t(contentV3.cta.bringLabel)}</div>

          <ul className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-3">
            {contentV3.cta.bring.map((item) => (
              <li key={item.number} className="border-t border-rule pt-6">
                <div className="font-display text-[13px] font-medium tracking-[0.12em] text-brandCrimson">
                  {item.number}
                </div>
                <h3 className="font-editorial mt-3 text-[20px] leading-snug font-normal text-ink">
                  {t(item.title)}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-charcoal">{t(item.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
