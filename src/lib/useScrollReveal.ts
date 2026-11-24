import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useScrollReveal(): void {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observed = new WeakSet<HTMLElement>();

    const prepareElement = (el: HTMLElement) => {
      const stagger = el.getAttribute('data-stagger-index');
      if (stagger !== null) {
        el.style.setProperty('--stagger', stagger);
      }
    };

    const markRevealed = (el: HTMLElement) => {
      if (el.getAttribute('data-revealed') === 'true') return;
      el.setAttribute('data-revealed', 'true');

      if (prefersReducedMotion) {
        el.style.willChange = 'auto';
        return;
      }

      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === el) {
          el.style.willChange = 'auto';
          el.removeEventListener('transitionend', handleTransitionEnd);
        }
      };

      el.addEventListener('transitionend', handleTransitionEnd);
      // Fallback cleanup in case transitionend is skipped
      window.setTimeout(() => {
        el.style.willChange = 'auto';
        el.removeEventListener('transitionend', handleTransitionEnd);
      }, 1000);
    };

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      const revealAll = () => {
        document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          prepareElement(el);
          markRevealed(el);
        });
      };
      revealAll();

      const mo = new MutationObserver(revealAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            markRevealed(el);
            observer.unobserve(el);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    const registerElements = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (observed.has(el)) return;

        observed.add(el);
        prepareElement(el);
        observer.observe(el);
      });
    };

    registerElements();

    // Watch for lazy-loaded Suspense sections mounting after initial load
    const mutationObserver = new MutationObserver(() => {
      registerElements();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [prefersReducedMotion]);
}
