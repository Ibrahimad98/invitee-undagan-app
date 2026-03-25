import { useEffect, useRef, useState } from 'react';

export type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

export function useScrollAnimation(threshold: number = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find the nearest scroll-snap container as the IntersectionObserver root
    const scrollParent = el.closest('.invitation-content') as HTMLElement | null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay so the snap-settle happens before animation starts
          requestAnimationFrame(() => setIsVisible(true));
          observer.disconnect();
        }
      },
      {
        root: scrollParent || null,
        // Pre-detect sections about to scroll into view
        rootMargin: '0px 0px 10% 0px',
        threshold: Math.min(threshold, 0.05),
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Returns CSS classes for scroll-triggered animations.
 * Usage: <div className={animClass(isVisible, 'fade-up', 200)}>
 */
export function animClass(
  isVisible: boolean,
  animation: AnimationType = 'fade-up',
  delayMs: number = 0,
): string {
  const base = 'transition-all ease-out';
  const duration = 'duration-700';
  const delay = delayMs ? `delay-[${delayMs}ms]` : '';

  const hidden: Record<AnimationType, string> = {
    'fade-up': 'opacity-0 translate-y-8',
    'fade-down': 'opacity-0 -translate-y-8',
    'fade-left': 'opacity-0 translate-x-8',
    'fade-right': 'opacity-0 -translate-x-8',
    'zoom-in': 'opacity-0 scale-90',
    'fade': 'opacity-0',
  };

  const visible = 'opacity-100 translate-y-0 translate-x-0 scale-100';

  return `${base} ${duration} ${delay} ${isVisible ? visible : hidden[animation]}`.trim();
}
