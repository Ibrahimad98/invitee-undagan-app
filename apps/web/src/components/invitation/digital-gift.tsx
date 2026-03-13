'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="invitation-section invitation-gift py-16 px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
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
