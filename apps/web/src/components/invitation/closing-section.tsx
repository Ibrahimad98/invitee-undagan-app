'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface CoInvitor {
  name: string;
  role?: string;
}

interface ClosingSectionProps {
  closingText?: string | null;
  coInvitors?: CoInvitor[];
}

export default function ClosingSection({ closingText, coInvitors }: ClosingSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="invitation-section invitation-closing px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-lg mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <SectionOrnament position="divider" />

        {closingText && (
          <p className="text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line">
            {closingText}
          </p>
        )}

        {/* Co-Invitors */}
        {coInvitors && coInvitors.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-[var(--inv-text-secondary)]">
              Turut Mengundang
            </p>
            {coInvitors.map((person, index) => (
              <div key={index}>
                <p className="font-medium text-sm">{person.name}</p>
                {person.role && (
                  <p className="text-xs text-[var(--inv-text-secondary)]">{person.role}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <SectionOrnament position="divider" />

        <p className="text-xs text-[var(--inv-text-secondary)]">
          Powered by <span className="font-semibold text-[var(--inv-accent)]">Invitee</span>
        </p>
      </div>
    </section>
  );
}
