'use client';

interface HeroSectionProps {
  openingText?: string | null;
  title: string;
}

export default function HeroSection({ openingText, title }: HeroSectionProps) {
  return (
    <section className="invitation-section invitation-hero py-12 sm:py-20 px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
        {/* SVG ornament */}
        <div className="flex justify-center">
          <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
            <path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {openingText && (
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line">
            {openingText}
          </p>
        )}

        <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif leading-tight">{title}</h2>

        <div className="w-16 sm:w-24 h-px bg-[var(--inv-accent)] mx-auto" />
      </div>
    </section>
  );
}
