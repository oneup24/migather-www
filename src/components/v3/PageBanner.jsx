import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import MockUpTag from './MockUpTag';

/**
 * The inner-page banner.
 *
 * The same cinematic treatment as the homepage hero — photograph, scrim,
 * one claim — at a shorter height. It keeps every page opening the same
 * way while leaving the homepage the fullest expression of the idea.
 */
export default function PageBanner({ image, eyebrow, title, lede, className, children }) {
  const { t } = useLocale();

  return (
    <section className={cn('relative isolate grain overflow-hidden bg-night', className)}>
      <img
        src={image.src}
        alt={t(image.alt)}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-scrim absolute inset-0" aria-hidden="true" />
      <MockUpTag placement="banner" />

      <div className="relative z-10 mx-auto flex min-h-[52svh] w-full max-w-7xl flex-col justify-end px-6 pb-12 pt-36 md:min-h-[58svh] md:pb-16">
        {eyebrow && <div className="eyebrow text-white/65">{eyebrow}</div>}

        <h1 className="font-editorial mt-5 max-w-[18ch] text-[clamp(2.2rem,4.8vw,4.2rem)] leading-[1.06] font-normal tracking-[-0.015em] text-white">
          {title}
        </h1>

        {lede && (
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/85 md:text-[17px]">
            {lede}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
