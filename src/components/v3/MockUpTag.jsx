import { mockUpTag as mockUpTagCopy } from '../../data/media';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/utils';

/**
 * The "mock-up" marker that sits on every generated image.
 *
 * The photographs in this build are generated placeholder artwork, not client
 * campaign photography. Some of them sit directly beside real, sourced client
 * results, so leaving them unmarked would let a reader take a picture of
 * Hong Kong for a picture of work Migather did. This tag is deliberately
 * small but never hidden — it is the difference between a mock-up and a
 * misrepresentation.
 *
 * `placement="banner"` moves it clear of the floating site header, for the
 * full-bleed images that carry their own text.
 */
export default function MockUpTag({ className, placement = 'inline' }) {
  const { t } = useLocale();

  return (
    <span
      className={cn(
        'mock-up-tag',
        'absolute z-10 bg-night/70 text-white/90 font-display font-medium',
        'text-[9px] uppercase tracking-[0.16em] px-2 py-[5px] leading-none',
        'backdrop-blur-[2px]',
        placement === 'banner' ? 'right-4 top-[86px]' : 'top-0 right-0',
        className,
      )}
    >
      {t(mockUpTagCopy)}
    </span>
  );
}
