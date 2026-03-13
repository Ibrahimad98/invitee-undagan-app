'use client';

import { formatDate } from '@invitee/shared';

interface CoverScreenProps {
  title: string;
  guestName: string;
  eventDate: Date | null;
  onOpen: () => void;
}

export default function CoverScreen({ title, guestName, eventDate, onOpen }: CoverScreenProps) {
  return (
    <div className="invitation-cover fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[var(--inv-bg-primary)] to-[var(--inv-bg-secondary)] text-[var(--inv-text-primary)]">
      <div className="text-center space-y-6 px-8 max-w-md animate-fade-in">
        {/* Ornament Top */}
        <div className="text-[var(--inv-accent)] text-4xl font-serif">✦</div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif leading-tight">{title}</h1>

        {/* Date */}
        {eventDate && (
          <p className="text-sm text-[var(--inv-text-secondary)] tracking-widest uppercase">
            {formatDate(eventDate.toISOString())}
          </p>
        )}

        {/* Divider */}
        <div className="w-16 h-px bg-[var(--inv-accent)] mx-auto opacity-50" />

        {/* Guest Name */}
        <div>
          <p className="text-xs text-[var(--inv-text-secondary)] uppercase tracking-wider mb-2">
            Kepada Yth.
          </p>
          <p className="text-xl font-semibold">{guestName}</p>
        </div>

        {/* Open Button */}
        <button
          onClick={onOpen}
          className="mt-8 px-8 py-3 bg-[var(--inv-accent)] text-[var(--inv-accent-text)] rounded-full text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity animate-bounce-slow"
        >
          Buka Undangan
        </button>
      </div>

      {/* Ornament Bottom */}
      <div className="absolute bottom-8 text-[var(--inv-accent)] text-2xl font-serif opacity-50">
        ❦
      </div>
    </div>
  );
}
