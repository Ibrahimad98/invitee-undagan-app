'use client';

/**
 * Theme-aware ornaments for each invitation section.
 * Corner ornaments are rendered as <img> elements loading
 * theme-specific SVG files from /images/ornaments/.
 * The theme slug is detected from the nearest .invitation-root parent.
 */

import { useState, useCallback } from 'react';

// Maps theme CSS class to corner SVG filename
const THEME_ORNAMENT_MAP: Record<string, string> = {
  'theme-super-classic': 'corner-super-classic.svg',
  'theme-floral-garden': 'corner-floral-garden.svg',
  'theme-kids-party': 'corner-kids-party.svg',
  'theme-golden-elegance': 'corner-golden-elegance.svg',
  'theme-royal-muslim': 'corner-royal-muslim.svg',
  'theme-wayang-heritage': 'corner-wayang-heritage.svg',
  'theme-slide-romantic': 'corner-slide-romantic.svg',
  'theme-christmas-joy': 'corner-christmas-joy.svg',
  'theme-modern-minimal': 'corner-modern-minimal.svg',
  'theme-simple-java': 'corner-simple-java.svg',
};

interface SectionOrnamentProps {
  position: 'top' | 'bottom' | 'frame' | 'divider';
  className?: string;
}

export default function SectionOrnament({ position, className = '' }: SectionOrnamentProps) {
  const [cornerSvg, setCornerSvg] = useState<string | null>(null);

  // Callback ref — fires once when the DOM element mounts
  const frameRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || position !== 'frame') return;
    const root = el.closest('.invitation-root');
    if (!root) return;
    for (const [cls, file] of Object.entries(THEME_ORNAMENT_MAP)) {
      if (root.classList.contains(cls)) {
        setCornerSvg(`/images/ornaments/${file}`);
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  if (position === 'divider') {
    return (
      <div className={`flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-1 ${className}`}>
        <svg className="flex-1 h-3 text-[var(--inv-accent)] opacity-30" viewBox="0 0 200 12" preserveAspectRatio="none">
          <path d="M200,6 L40,6 Q20,6 15,2 Q10,6 5,6 L0,6" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="15" cy="2" r="1.5" fill="currentColor" />
        </svg>
        <svg width="22" height="22" viewBox="0 0 40 40" className="text-[var(--inv-accent)] opacity-40 shrink-0">
          <path d="M20 4l3 8h8l-6.5 5 2.5 8L20 19l-7 6 2.5-8L9 12h8z" fill="currentColor" />
        </svg>
        <svg className="flex-1 h-3 text-[var(--inv-accent)] opacity-30" viewBox="0 0 200 12" preserveAspectRatio="none">
          <path d="M0,6 L160,6 Q180,6 185,2 Q190,6 195,6 L200,6" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="185" cy="2" r="1.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (position === 'frame') {
    return (
      <div ref={frameRef} className={`absolute inset-0 pointer-events-none z-0 ${className}`} aria-hidden="true">
        {/* Inner border frame */}
        <div className="absolute inset-3 sm:inset-4 border border-[var(--inv-accent)] opacity-[0.08] rounded-sm" />

        {cornerSvg && (
          <>
            {/* Top-left corner */}
            <img
              src={cornerSvg}
              alt=""
              className="absolute top-0 left-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-90"
              draggable={false}
            />
            {/* Top-right corner */}
            <img
              src={cornerSvg}
              alt=""
              className="absolute top-0 right-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-90"
              style={{ transform: 'scaleX(-1)' }}
              draggable={false}
            />
            {/* Bottom-left corner */}
            <img
              src={cornerSvg}
              alt=""
              className="absolute bottom-0 left-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-90"
              style={{ transform: 'scaleY(-1)' }}
              draggable={false}
            />
            {/* Bottom-right corner */}
            <img
              src={cornerSvg}
              alt=""
              className="absolute bottom-0 right-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-90"
              style={{ transform: 'scale(-1, -1)' }}
              draggable={false}
            />
          </>
        )}
      </div>
    );
  }

  // position === 'top' or 'bottom'
  const isTop = position === 'top';
  return (
    <div
      className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 pointer-events-none overflow-hidden h-12 sm:h-16 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full text-[var(--inv-accent)] opacity-[0.05]"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        style={isTop ? undefined : { transform: 'scaleY(-1)' }}
      >
        <path d="M0,40 Q50,20 100,30 Q150,40 200,25 Q250,10 300,28 Q350,40 400,35 L400,0 L0,0 Z" fill="currentColor" opacity="0.4" />
        <path d="M0,40 Q80,25 160,35 Q240,45 320,30 Q360,25 400,38 L400,0 L0,0 Z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );
}
