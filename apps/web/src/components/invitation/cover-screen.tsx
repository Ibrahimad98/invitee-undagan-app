'use client';

import { useCallback, useState } from 'react';
import { formatDate } from '@invitee/shared';
import { getEventTypeConfig } from '@/lib/event-type-config';

interface ThemeConfig {
  frameBg: string;
  coverBg: string;
  coverOverlay?: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  ornamentTop: string;
  ornamentBottom: string;
}

interface CoverScreenProps {
  title: string;
  guestName: string;
  eventDate: Date | null;
  onOpen: () => void;
  themeConfig?: ThemeConfig;
  eventType?: string;
}

/* ─── Theme-specific cover ornaments (same as preview THEME_CONFIG) ─── */
const COVER_ORNAMENTS: Record<string, { top: string; bottom: string }> = {
  'theme-super-classic': {
    top: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="currentColor"/></svg>`,
    bottom: `<svg width="32" height="32" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="currentColor" opacity="0.5"/></svg>`,
  },
  'theme-simple-java': {
    top: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="currentColor" opacity="0.7"/><path d="M30,4 L38,10 L30,16 L22,10Z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M50,2 L60,10 L50,18 L40,10Z" fill="currentColor" opacity="0.7"/></svg>`,
    bottom: `<svg width="40" height="24" viewBox="0 0 40 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="currentColor" opacity="0.4"/><path d="M30,2 L40,10 L30,18 L20,10Z" fill="currentColor" opacity="0.4"/></svg>`,
  },
  'theme-golden-elegance': {
    top: `<svg width="44" height="44" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="currentColor"/></svg>`,
    bottom: `<svg width="36" height="36" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="currentColor" opacity="0.6"/></svg>`,
  },
  'theme-royal-muslim': {
    top: `<svg width="48" height="48" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.6"/><polygon points="12,3 14,8 19,8 15,12 16.5,17 12,14 7.5,17 9,12 5,8 10,8" fill="currentColor" opacity="0.12"/></svg>`,
    bottom: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="currentColor" stroke-width="1" opacity="0.35"/></svg>`,
  },
  'theme-kids-party': {
    top: `<svg width="36" height="44" viewBox="0 0 28 28"><path d="M14,2 L19,20 L9,20Z" fill="currentColor" opacity="0.8"/><circle cx="14" cy="2" r="2.5" fill="#feca57"/><line x1="14" y1="2" x2="8" y2="8" stroke="#48dbfb" stroke-width="1"/><line x1="14" y1="2" x2="20" y2="8" stroke="#ff9ff3" stroke-width="1"/><line x1="14" y1="2" x2="14" y2="10" stroke="#feca57" stroke-width="1"/></svg>`,
    bottom: `<svg width="60" height="16" viewBox="0 0 60 12"><circle cx="10" cy="6" r="4" fill="#ff6b6b" opacity="0.6"/><circle cx="30" cy="6" r="5" fill="#feca57" opacity="0.7"/><circle cx="50" cy="6" r="4" fill="#48dbfb" opacity="0.6"/></svg>`,
  },
  'theme-wayang-heritage': {
    top: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L18,10 L10,18 L2,10Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><path d="M30,4 L36,10 L30,16 L24,10Z" fill="currentColor" opacity="0.15"/><path d="M50,2 L58,10 L50,18 L42,10Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/></svg>`,
    bottom: `<svg width="40" height="16" viewBox="0 0 40 16"><path d="M20,2 L28,8 L20,14 L12,8Z" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/></svg>`,
  },
  'theme-modern-minimal': {
    top: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="currentColor" stroke-width="0.5" opacity="0.2"/></svg>`,
    bottom: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="currentColor" stroke-width="0.5" opacity="0.2"/></svg>`,
  },
  'theme-floral-garden': {
    top: `<svg width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3.5" fill="currentColor" opacity="0.8"/><circle cx="5" cy="11" r="3.5" fill="currentColor" opacity="0.7"/><circle cx="19" cy="11" r="3.5" fill="currentColor" opacity="0.7"/><circle cx="8" cy="19" r="3.5" fill="currentColor" opacity="0.6"/><circle cx="16" cy="19" r="3.5" fill="currentColor" opacity="0.6"/><circle cx="12" cy="11" r="2.5" fill="var(--inv-cover-text, currentColor)"/></svg>`,
    bottom: `<svg width="36" height="36" viewBox="0 0 32 32"><path d="M16 4c3 4 8 6 12 6-2 4-2 9 0 13-4 0-9 2-12 6-3-4-8-6-12-6 2-4 2-9 0-13 4 0 9-2 12-6z" fill="currentColor" opacity="0.15"/><circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.12"/></svg>`,
  },
  'theme-christmas-joy': {
    top: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="currentColor" opacity="0.5"/></svg>`,
    bottom: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="#27ae60" opacity="0.35"/></svg>`,
  },
  'theme-slide-romantic': {
    top: `<svg width="40" height="36" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="currentColor" opacity="0.25"/></svg>`,
    bottom: `<svg width="32" height="28" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="currentColor" opacity="0.15"/></svg>`,
  },
};

const THEME_SLUGS = [
  'theme-super-classic', 'theme-floral-garden', 'theme-kids-party', 'theme-golden-elegance',
  'theme-royal-muslim', 'theme-wayang-heritage', 'theme-slide-romantic', 'theme-christmas-joy',
  'theme-modern-minimal', 'theme-simple-java',
];

export default function CoverScreen({ title, guestName, eventDate, onOpen, themeConfig, eventType }: CoverScreenProps) {
  const tc = themeConfig;
  const textColor = tc ? tc.textPrimary : 'var(--inv-cover-text)';
  const textSecondary = tc ? tc.textSecondary : 'var(--inv-cover-text-secondary)';
  const borderColor = tc ? tc.borderColor : 'var(--inv-cover-border)';

  const coverLabel = eventType ? getEventTypeConfig(eventType).coverLabel : 'Undangan Pernikahan';

  // Detect theme from DOM for ornament selection when no themeConfig
  const [detectedTheme, setDetectedTheme] = useState<string | null>(null);
  const coverRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || tc) return;
    const root = el.closest('.invitation-root');
    if (!root) return;
    for (const slug of THEME_SLUGS) {
      if (root.classList.contains(slug)) {
        setDetectedTheme(slug);
        return;
      }
    }
  }, [tc]);

  // Resolve ornaments: preview themeConfig > detected theme > fallback
  const ornaments = tc
    ? { top: tc.ornamentTop, bottom: tc.ornamentBottom }
    : detectedTheme && COVER_ORNAMENTS[detectedTheme]
      ? COVER_ORNAMENTS[detectedTheme]
      : {
          top: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor"/></svg>`,
          bottom: `<svg width="28" height="28" viewBox="0 0 32 32"><path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="2.5" fill="currentColor"/></svg>`,
        };

  return (
    <div
      ref={coverRef}
      className="invitation-cover fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        ...(tc ? { background: tc.coverBg, color: textColor } : { color: 'var(--inv-cover-text)' }),
      }}
    >
      {/* Decorative border frame */}
      <div
        className="absolute inset-4 sm:inset-5 rounded-sm pointer-events-none"
        style={{ border: `1.5px solid ${borderColor}`, opacity: 0.3 }}
      />
      <div
        className="absolute inset-6 sm:inset-8 rounded-sm pointer-events-none"
        style={{ border: `1px solid ${borderColor}`, opacity: 0.15 }}
      />

      <div className="text-center space-y-4 sm:space-y-5 px-6 sm:px-10 max-w-sm animate-fade-in relative z-10">
        {/* Top ornament */}
        <div
          className="flex justify-center"
          dangerouslySetInnerHTML={{ __html: ornaments.top }}
        />

        {/* "UNDANGAN" label — matching thumbnail style */}
        <p
          className="text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium"
          style={{ color: textSecondary }}
        >
          {coverLabel}
        </p>

        {/* Title / Names */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-serif leading-tight text-center"
          style={{ color: textColor }}
        >
          {(() => {
            const parts = title.split(' ');
            const ampIdx = parts.indexOf('&');
            if (ampIdx >= 2) {
              const prefix = parts.slice(0, ampIdx - 1).join(' ');
              const names = parts.slice(ampIdx - 1).join(' ');
              return (
                <>
                  <span className="block text-sm sm:text-base tracking-[0.25em] uppercase opacity-70 mb-2" style={{ color: textSecondary }}>{prefix}</span>
                  <span className="block">{names}</span>
                </>
              );
            }
            return title;
          })()}
        </h1>

        {/* Date */}
        {eventDate && (
          <p
            className="text-xs sm:text-sm tracking-widest uppercase"
            style={{ color: textSecondary }}
          >
            {formatDate(eventDate.toISOString())}
          </p>
        )}

        {/* Divider line */}
        <div
          className="w-14 sm:w-20 h-px mx-auto"
          style={{ background: borderColor, opacity: 0.4 }}
        />

        {/* Guest Name */}
        <div>
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2"
            style={{ color: textSecondary }}
          >
            Kepada Yth.
          </p>
          <p className="text-lg sm:text-xl font-semibold" style={{ color: textColor }}>
            {guestName}
          </p>
        </div>

        {/* Open Button */}
        <button
          onClick={onOpen}
          className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 rounded-full text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity animate-bounce-slow"
          style={{
            background: tc ? tc.accent : 'var(--inv-accent)',
            color: tc ? (tc.accent === '#1a1a1a' ? '#ffffff' : tc.textPrimary.startsWith('#f') || tc.textPrimary === '#ffffff' ? '#ffffff' : tc.frameBg) : 'var(--inv-accent-text)',
          }}
        >
          Buka Undangan
        </button>
      </div>

      {/* Bottom ornament */}
      <div
        className="absolute bottom-6 sm:bottom-10 flex justify-center opacity-60"
        dangerouslySetInnerHTML={{ __html: ornaments.bottom }}
      />
    </div>
  );
}
