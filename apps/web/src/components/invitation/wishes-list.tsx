'use client';

import { useRsvps } from '@/hooks/queries/use-rsvps';
import { formatDate } from '@invitee/shared';

interface WishesListSectionProps {
  invitationId: string;
}

export default function WishesListSection({ invitationId }: WishesListSectionProps) {
  const { data: rsvpData } = useRsvps(invitationId);
  const wishes = (rsvpData?.data || []).filter((r: any) => r.message);

  if (wishes.length === 0) return null;

  return (
    <section className="invitation-section invitation-wishes py-10 sm:py-16 px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-md mx-auto space-y-6 sm:space-y-8">
        <h3 className="text-center text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Ucapan & Doa
        </h3>

        <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-2">
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
      </div>
    </section>
  );
}
