'use client';

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

export default function CoverScreen({ title, guestName, eventDate, onOpen, themeConfig, eventType }: CoverScreenProps) {
  // If themeConfig is provided (preview), use its colors; otherwise fall back to CSS vars
  const tc = themeConfig;
  const bgStyle = tc ? { background: tc.coverBg } : {};
  const textColor = tc ? tc.textPrimary : 'var(--inv-text-primary)';
  const textSecondary = tc ? tc.textSecondary : 'var(--inv-text-secondary)';
  const accentColor = tc ? tc.accent : 'var(--inv-accent)';
  const borderColor = tc ? tc.borderColor : 'var(--inv-accent)';

  const coverLabel = eventType ? getEventTypeConfig(eventType).coverLabel : 'Undangan Pernikahan';

  return (
    <div
      className="invitation-cover fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        ...bgStyle,
        ...(!tc ? {
          background: 'linear-gradient(to bottom, var(--inv-bg-primary), var(--inv-bg-secondary))',
        } : {}),
        color: textColor,
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
          dangerouslySetInnerHTML={{
            __html: tc
              ? tc.ornamentTop
              : `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="${accentColor}"/></svg>`
          }}
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
        dangerouslySetInnerHTML={{
          __html: tc
            ? tc.ornamentBottom
            : `<svg width="28" height="28" viewBox="0 0 32 32"><path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="${accentColor}" stroke-width="1.5"/><circle cx="16" cy="16" r="2.5" fill="${accentColor}"/></svg>`
        }}
      />
    </div>
  );
}
