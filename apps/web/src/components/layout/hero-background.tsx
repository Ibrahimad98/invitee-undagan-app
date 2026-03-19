'use client';

import { useState, useEffect } from 'react';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1920&q=80',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1920&q=80',
];

/**
 * Animated hero background slideshow with gradient overlay.
 * Used across all public pages for consistent branding.
 */
export function HeroBackground() {
  const [bgIdx, setBgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIdx((prev) => (prev + 1) % BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Animated slideshow images */}
      {BG_IMAGES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === bgIdx ? 0.35 : 0,
          }}
          aria-hidden="true"
        />
      ))}
      {/* Gradient overlay — lighter so background is more visible */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white"
        aria-hidden="true"
      />
    </>
  );
}
