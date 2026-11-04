import { useEffect } from 'react';

/** Locks body scroll while a mobile drawer or modal is open. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
