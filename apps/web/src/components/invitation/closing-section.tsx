'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import { useCallback, useState } from 'react';
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

  // Detect royal-blossom theme for Pixabay credit
  const [isRoyalBlossom, setIsRoyalBlossom] = useState(false);
  const sectionRef = useCallback(
    (el: HTMLElement | null) => {
      (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      if (!el) return;
      const root = el.closest('.invitation-root');
      if (root?.classList.contains('theme-royal-blossom')) {
        setIsRoyalBlossom(true);
      }
    },
    [ref]
  );

  return (
    <section ref={sectionRef} className="invitation-section invitation-closing px-8 sm:px-12 py-14 sm:py-16 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-lg mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
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

        {/* Pixabay credit for Royal Blossom theme */}
        {isRoyalBlossom && (
          <p className="text-[10px] text-[var(--inv-text-secondary)] opacity-60">
            Floral assets by{' '}
            <a href="https://pixabay.com/users/lucianapappdesign-11674722/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
              lucianapappdesign
            </a>{' '}
            via Pixabay
          </p>
        )}

        <p className="text-xs text-[var(--inv-text-secondary)]">
          Powered by <span className="font-semibold text-[var(--inv-accent)]">Invitee</span>
        </p>
      </div>
    </section>
  );
}
