import { useEffect } from 'react';

/**
 * useScrollReveal:
 * Automatically finds all elements with `.reveal`, `.reveal-scale`, `.reveal-left`, or `.reveal-right`
 * and applies `.revealed` when they scroll into the viewport.
 * 
 * Can also re-observe when dependency triggers (e.g. data load).
 */
export const useScrollReveal = (deps = []) => {
  useEffect(() => {
    // If IntersectionObserver is not supported, reveal immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target); // Trigger once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, deps);
};

export default useScrollReveal;

