'use client';

import { useRsvps } from '@/hooks/queries/use-rsvps';
import { formatDate } from '@invitee/shared';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface WishesListSectionProps {
  invitationId: string;
}

export default function WishesListSection({ invitationId }: WishesListSectionProps) {
  const { data: rsvpData } = useRsvps(invitationId);
  const wishes = (rsvpData?.data || []).filter((r: any) => r.message);
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="invitation-section invitation-wishes px-8 sm:px-12 py-14 sm:py-16 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <h3 className="text-center text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Ucapan & Doa
        </h3>

        {wishes.length === 0 ? (
          <p className="text-center text-sm text-[var(--inv-text-secondary)] opacity-70 italic py-4">
            ✨ Jadilah yang pertama menuliskan ucapan dan doa untuk kami ✨
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-[32rem] overflow-y-auto pr-2 invitation-wishes-scroll">
            {wishes.map((rsvp: any) => (
              <div
                key={rsvp.id}
                className="p-3 sm:p-4 rounded-xl bg-[var(--inv-bg-secondary)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{rsvp.guestName}</p>
                  <span className="text-xs text-[var(--inv-text-secondary)]">
                    {rsvp.attendance === 'ATTENDING' ? '✓ Hadir' : rsvp.attendance === 'NOT_ATTENDING' ? '✕ Tidak' : '? Mungkin'}
                  </span>
                </div>
                <p className="text-sm text-[var(--inv-text-secondary)] leading-relaxed">
                  {rsvp.message}
                </p>
                <p className="text-xs text-[var(--inv-text-secondary)] opacity-60">
                  {formatDate(rsvp.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
