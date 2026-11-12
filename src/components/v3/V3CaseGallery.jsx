import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';
import { contentV3 } from '../../data/content.v3';
import MockUpTag from './MockUpTag';

/**
 * The case gallery — the run of frames under the case information.
 *
 * The case page describes the work in words: scope, client, since. The
 * gallery is the same work in pictures, and it sits directly under that
 * description, so a reader finishes the argument and then sees it.
 *
 * The layout follows the page's own grammar rather than a photo-wall one:
 * the label sits in the left gutter with the statement in the right
 * three-quarters (the editorial row), the frames run edge to edge with no
 * card chrome, and each one is a square — 1:1, three across on the
 * desktop, two on the tablet, two on the phone.
 *
 * A frame carries its caption the way the scope list carries its numbers:
 * a crimson index in the gutter and a small caps label beside it.
 *
 * Every frame is mock-up artwork, and says so: the `MOCK-UP` tag sits on
 * the image, the alt text opens with "mock-up" in all three languages, and
 * the section repeats the disclosure under the grid. A frame whose
 * `mockup` flag is false is not tagged — the same per-image exit the case
 * banners have.
 */
export default function V3CaseGallery({ images = [], className }) {
  const { t } = useLocale();

  if (!images.length) return null;

  return (
    <section
      className={cn('bg-paper py-20 md:py-24', className)}
      aria-labelledby="case-gallery-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="editorial">
          <div className="editorial-label">{t(contentV3.gallery.label)}</div>

          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <h2 id="case-gallery-heading" className="editorial-statement editorial-statement--sm">
              {t(contentV3.gallery.statement)}
            </h2>
            <span className="eyebrow text-muted">
              {String(images.length).padStart(2, '0')} {t(contentV3.gallery.frames)}
            </span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {images.map((image, index) => (
            <figure key={image.src} className="group">
              <div className="frame relative aspect-square">
                <img
                  src={image.src}
                  alt={t(image.alt)}
                  loading="lazy"
                  decoding="async"
                />
                {image.mockup && <MockUpTag />}
              </div>

              <figcaption className="mt-4 flex items-baseline gap-3 border-t border-rule pt-3">
                <span className="font-display text-[11px] font-medium tracking-[0.14em] text-brandCrimson">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="eyebrow text-muted">{t(image.caption)}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 border-l-2 border-brandBlue/30 pl-4 text-[12px] leading-relaxed text-muted">
          {t(contentV3.disclosure.galleryNote)}
        </p>
      </div>
    </section>
  );
}
