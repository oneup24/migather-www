import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Capture mode.
 *
 * Two things have to be true for a full-page screenshot to be usable:
 *
 *  1. Anything animated in on a scroll-driven timeline must already be in
 *     its final state, or the lower half of the page comes out blank.
 *
 *  2. Every image must have loaded. The work grid lazy-loads its
 *     photography, and a lazy image that has never entered the viewport
 *     never starts fetching — so a below-the-fold screenshot renders an
 *     empty frame with the caption and nothing in it.
 *
 * Adding `?capture=1` to any URL forces both. The image part watches for
 * new nodes as well, because React can mount an image after the flag has
 * been set.
 *
 *   http://localhost:4176/en?capture=1
 *
 * The flag is also the fastest way to print a clean PDF of the site.
 */
export default function CaptureMode() {
  const { search } = useLocation();

  useEffect(() => {
    const enabled = new URLSearchParams(search).has('capture');
    const root = document.documentElement;

    if (!enabled) {
      root.removeAttribute('data-capture');
      return undefined;
    }

    root.setAttribute('data-capture', 'true');

    /** Pull any lazy image into eager loading so it actually fetches. */
    const promote = (node) => {
      if (node.tagName === 'IMG' && node.loading === 'lazy') {
        node.loading = 'eager';
      }
      node.querySelectorAll?.('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
    };

    promote(document);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach(promote);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      root.removeAttribute('data-capture');
    };
  }, [search]);

  return null;
}
