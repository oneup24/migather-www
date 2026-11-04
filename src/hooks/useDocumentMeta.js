import { useEffect } from 'react';
import { site } from '../data/site';

/**
 * Minimal document head manager — replaces react-helmet-async so the site
 * carries no extra runtime dependency for something this small.
 *
 * `path` should be the locale-prefixed path, so canonical and og:url point
 * at the language the reader is actually on.
 */
export function useDocumentMeta({ title, description, path } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — Performance Digital Creative & Media Agency`;
    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      if (!value) return;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
        const key = selector.startsWith('link') ? 'rel' : attr;
        tag.setAttribute(key, selector.startsWith('link') ? 'canonical' : attr);
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) ogDescription.setAttribute('content', description);

    const href = `${site.url}${path ?? window.location.pathname}`;
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', href);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', href);
  }, [title, description, path]);
}
