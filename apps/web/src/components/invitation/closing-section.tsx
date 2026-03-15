'use client';

interface CoInvitor {
  name: string;
  role?: string;
}

interface ClosingSectionProps {
  closingText?: string | null;
  coInvitors?: CoInvitor[];
}

export default function ClosingSection({ closingText, coInvitors }: ClosingSectionProps) {
  return (
    <section className="invitation-section invitation-closing py-12 sm:py-20 px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-lg mx-auto space-y-6 sm:space-y-8">
        {/* SVG ornament */}
        <div className="flex justify-center">
          <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
            <path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
          </svg>
        </div>

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

        <div className="w-16 h-px bg-[var(--inv-accent)] mx-auto opacity-50" />

        <p className="text-xs text-[var(--inv-text-secondary)]">
          Powered by <span className="font-semibold text-[var(--inv-accent)]">Invitee</span>
        </p>
      </div>
    </section>
  );
}
