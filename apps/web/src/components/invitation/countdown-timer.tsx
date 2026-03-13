'use client';

import { useCountdown } from '@/hooks/use-countdown';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <section className="invitation-section invitation-countdown py-16 px-8 text-center bg-[var(--inv-bg-secondary)] text-[var(--inv-text-primary)]">
        <div className="max-w-lg mx-auto">
          <p className="text-lg font-serif text-[var(--inv-accent)]">Acara telah berlangsung</p>
        </div>
      </section>
    );
  }

  const units = [
    { value: days, label: 'Hari' },
    { value: hours, label: 'Jam' },
    { value: minutes, label: 'Menit' },
    { value: seconds, label: 'Detik' },
  ];

  return (
    <section className="invitation-section invitation-countdown py-16 px-8 text-center bg-[var(--inv-bg-secondary)] text-[var(--inv-text-primary)]">
      <div className="max-w-lg mx-auto space-y-8">
        <h3 className="text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Menghitung Hari
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {units.map((unit) => (
            <div key={unit.label} className="space-y-2">
              <div className="text-3xl md:text-5xl font-bold text-[var(--inv-accent)] font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--inv-text-secondary)]">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
