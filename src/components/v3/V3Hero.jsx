import { Link } from 'react-router-dom';
import { content } from '../../data/content';
import { contentV3 } from '../../data/content.v3';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import Icon from '../ui/Icon';
import Highlight from './Highlight';
import MockUpTag from './MockUpTag';

/**
 * The cinematic hero — GAIA's communication pattern.
 *
 * One photograph, one claim, and the page index carried as large numerals
 * anchored to the bottom edge of the image. The dark ground here comes from
 * the photograph and the scrim over it; the house ground stays white
 * everywhere below.
 *
 * The site header floats over this section (see `SiteHeader`), which is why
 * the top padding here is generous.
 */
export default function V3Hero({ image, className }) {
  const { t, path } = useLocale();
  const hero = content.home.hero;

  return (
    <section
      className={cn('relative isolate grain overflow-hidden bg-night', className)}
      aria-label={t(hero.eyebrow)}
    >
      <img
        src={image.src}
        alt={t(image.alt)}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-scrim absolute inset-0" aria-hidden="true" />
      <MockUpTag placement="banner" />

      <div className="relative z-10 mx-auto flex min-h-[86svh] w-full max-w-7xl flex-col justify-end px-6 pb-9 pt-36 md:min-h-[92svh] md:pb-12">
        <div className="mb-7 flex items-center gap-4">
          <span className="eyebrow border border-white/30 px-2.5 py-1 text-white/70">
            {t(contentV3.hero.versionBadge)}
          </span>
          <span className="eyebrow text-white/55">{t(hero.eyebrow)}</span>
        </div>

        <h1 className="font-editorial text-white max-w-[19ch] text-[clamp(2.5rem,6.2vw,5.4rem)] leading-[1.04] font-normal tracking-[-0.02em]">
          <Highlight
            text={t(hero.title)}
            phrase={t(contentV3.hero.titleMark)}
            markClassName="text-crimsonOnDark"
          />
        </h1>

        <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              {t(hero.lede)}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to={path('/work')}
                className="inline-flex items-center gap-2 bg-white px-7 py-3.5 font-display text-[13px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-brandBlue hover:text-white"
              >
                {t(hero.primaryCta)}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
              <Link
                to={path('/contact')}
                className="inline-flex items-center gap-2 border border-white/50 px-7 py-3.5 font-display text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                {t(hero.secondaryCta)}
              </Link>
            </div>
          </div>

          {/* The house belief, quoted. It sits opposite the lede, the way the
              agency video carries it. */}
          <aside className="lg:col-span-5 lg:pt-1">
            <div className="border-l-2 border-brandCrimson bg-paper/95 px-6 py-6 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)] backdrop-blur-[2px]">
              <div className="eyebrow text-brandCrimson">{t(hero.belief.label)}</div>
              <p className="font-editorial mt-4 text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.35] font-normal text-ink">
                “{t(hero.belief.quote)}”
              </p>
              <p className="mt-4 font-display text-[13px] font-medium tracking-[0.06em] text-brandCrimson uppercase">
                — {t(hero.belief.attribution)}
              </p>
            </div>
          </aside>
        </div>

        <nav className="index-nav mt-14 md:mt-20" aria-label={t(contentV3.labels.work)}>
          {contentV3.index.items.map((item) => {
            const label = (
              <>
                <div className="index-nav__label">{t(item.label)}</div>
                <div className="index-nav__number">{item.number}</div>
              </>
            );

            // An entry points at a section of this page, or — where the
            // section has moved to its own page — at that page.
            return item.to ? (
              <Link key={item.number} to={path(item.to)} className="index-nav__link group">
                {label}
              </Link>
            ) : (
              <a key={item.number} href={item.href} className="index-nav__link group">
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
