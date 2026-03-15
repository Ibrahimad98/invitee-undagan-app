'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface HeroSectionProps {
  openingText?: string | null;
  title: string;
}

export default function HeroSection({ openingText, title }: HeroSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section ref={ref} className="invitation-section invitation-hero px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-lg mx-auto space-y-4 sm:space-y-6 w-full ${animClass(isVisible, 'fade-up')}`}>
        {/* SVG ornament */}
        <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
          <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
            <path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {openingText && (
          <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>
            {openingText}
          </p>
        )}

        <h2 className={`text-2xl sm:text-3xl md:text-5xl font-serif leading-tight ${animClass(isVisible, 'fade-up', 300)}`}>{title}</h2>

        <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
      </div>

      {/* Scroll down hint */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${animClass(isVisible, 'fade', 800)}`}>
        <div className="animate-bounce-slow text-[var(--inv-text-secondary)] opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
