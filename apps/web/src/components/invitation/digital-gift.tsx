'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface GiftAccount {
  bankName: string;
  accountNumber: string;
  accountHolder?: string;
}

interface DigitalGiftSectionProps {
  accounts: GiftAccount[];
}

export default function DigitalGiftSection({ accounts }: DigitalGiftSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { ref, isVisible } = useScrollAnimation(0.1);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section ref={ref} className="invitation-section invitation-gift px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <SectionOrnament position="divider" className="mb-2" />
        <div className="text-center space-y-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
            Amplop Digital
          </h3>
          <p className="text-xs text-[var(--inv-text-secondary)]">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami
          </p>
        </div>

        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-[var(--inv-bg-secondary)] space-y-3"
            >
              <p className="text-sm font-semibold text-[var(--inv-accent)]">
                {account.bankName}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-mono tracking-wider">{account.accountNumber}</p>
                <button
                  onClick={() => handleCopy(account.accountNumber, index)}
                  className="p-2 rounded-lg bg-[var(--inv-accent)]/10 text-[var(--inv-accent)] hover:bg-[var(--inv-accent)]/20 transition-colors"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {account.accountHolder && (
                <p className="text-xs text-[var(--inv-text-secondary)]">
                  a.n. {account.accountHolder}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
