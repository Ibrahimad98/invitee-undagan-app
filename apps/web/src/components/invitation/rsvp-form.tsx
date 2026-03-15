'use client';

import { useState } from 'react';
import { useCreateRsvp } from '@/hooks/queries/use-rsvps';
import { ATTENDANCE_LABELS } from '@invitee/shared';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface RsvpFormSectionProps {
  invitationId: string;
  guestName: string;
}

export default function RsvpFormSection({ invitationId, guestName }: RsvpFormSectionProps) {
  const [name, setName] = useState(guestName !== 'Tamu Undangan' ? guestName : '');
  const [attendance, setAttendance] = useState<string>('PRESENT');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [wishes, setWishes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { ref, isVisible } = useScrollAnimation(0.1);

  const createRsvp = useCreateRsvp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Map frontend values to backend DTO field names
    const attendanceMap: Record<string, string> = {
      'PRESENT': 'ATTENDING',
      'ABSENT': 'NOT_ATTENDING',
      'MAYBE': 'MAYBE',
    };

    try {
      await createRsvp.mutateAsync({
        invitationId,
        guestName: name,
        attendance: attendanceMap[attendance] || attendance,
        numGuests: numberOfGuests,
        message: wishes || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('RSVP failed:', error);
    }
  };

  if (submitted) {
    return (
      <section ref={ref} className="invitation-section invitation-rsvp px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
        <SectionOrnament position="frame" />
        <div className={`max-w-md mx-auto space-y-4 w-full ${animClass(isVisible, 'zoom-in')}`}>
          <div className="text-4xl">💝</div>
          <h3 className="text-xl font-serif">Terima Kasih!</h3>
          <p className="text-sm text-[var(--inv-text-secondary)]">
            Konfirmasi kehadiran Anda telah kami terima.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="invitation-section invitation-rsvp px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <SectionOrnament position="divider" className="mb-2" />
        <div className="text-center space-y-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
            Konfirmasi Kehadiran
          </h3>
          <p className="text-xs text-[var(--inv-text-secondary)]">
            Mohon konfirmasi kehadiran Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[var(--inv-text-secondary)]">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 rounded-xl bg-[var(--inv-bg-primary)] border border-[var(--inv-accent)]/20 text-[var(--inv-text-primary)] text-sm focus:ring-2 focus:ring-[var(--inv-accent)] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[var(--inv-text-secondary)]">Kehadiran</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PRESENT', 'ABSENT', 'MAYBE'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAttendance(status)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    attendance === status
                      ? 'bg-[var(--inv-accent)] text-[var(--inv-accent-text)]'
                      : 'bg-[var(--inv-bg-primary)] text-[var(--inv-text-secondary)] border border-[var(--inv-accent)]/20'
                  }`}
                >
                  {status === 'PRESENT' ? '✓ Hadir' : status === 'ABSENT' ? '✕ Tidak' : '? Mungkin'}
                </button>
              ))}
            </div>
          </div>

          {attendance === 'PRESENT' && (
            <div>
              <label className="block text-sm mb-1 text-[var(--inv-text-secondary)]">Jumlah Tamu</label>
              <input
                type="number"
                min={1}
                max={10}
                value={numberOfGuests}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNumberOfGuests(isNaN(val) || val < 1 ? 1 : val > 10 ? 10 : val);
                }}
                onBlur={(e) => {
                  if (!e.target.value || parseInt(e.target.value) < 1) setNumberOfGuests(1);
                }}
                className="w-full px-4 py-3 rounded-xl bg-[var(--inv-bg-primary)] border border-[var(--inv-accent)]/20 text-[var(--inv-text-primary)] text-sm focus:ring-2 focus:ring-[var(--inv-accent)] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-[var(--inv-text-secondary)]">Ucapan & Doa</label>
            <textarea
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Tulis ucapan dan doa untuk kedua mempelai..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--inv-bg-primary)] border border-[var(--inv-accent)]/20 text-[var(--inv-text-primary)] text-sm focus:ring-2 focus:ring-[var(--inv-accent)] outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={createRsvp.isPending}
            className="w-full px-6 py-3 bg-[var(--inv-accent)] text-[var(--inv-accent-text)] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createRsvp.isPending ? 'Mengirim...' : 'Kirim Konfirmasi'}
          </button>
        </form>
      </div>
    </section>
  );
}
