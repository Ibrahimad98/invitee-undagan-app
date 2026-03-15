'use client';

import { useCountdown } from '@/hooks/use-countdown';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  const { ref, isVisible } = useScrollAnimation(0.15);

  if (isExpired) {
    return (
      <section ref={ref} className="invitation-section invitation-countdown px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
        <SectionOrnament position="frame" />
        <div className={`max-w-lg mx-auto w-full ${animClass(isVisible, 'fade-up')}`}>
          <p className="text-base sm:text-lg font-serif text-[var(--inv-accent)]">Acara telah berlangsung</p>
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
    <section ref={ref} className="invitation-section invitation-countdown px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-lg mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <SectionOrnament position="divider" className="mb-2" />
        <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Menghitung Hari
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {units.map((unit, i) => (
            <div key={unit.label} className={`space-y-1 sm:space-y-2 ${animClass(isVisible, 'zoom-in', i * 100)}`}>
              <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-[var(--inv-accent)] font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--inv-text-secondary)]">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
