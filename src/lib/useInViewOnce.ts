import { useEffect, useRef, useState, type RefObject } from 'react';

export interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInViewOnce<T extends Element>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
}: InViewOptions = {}): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  return { ref, inView };
}

export function useInViewActive<T extends Element>({
  threshold = 0.05,
  rootMargin = '0px',
}: InViewOptions = {}): { ref: RefObject<T | null>; isActive: boolean } {
  const ref = useRef<T | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsActive(entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isActive };
}
