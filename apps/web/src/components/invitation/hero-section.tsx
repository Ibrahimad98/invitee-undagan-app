'use client';

interface HeroSectionProps {
  openingText?: string | null;
  title: string;
}

export default function HeroSection({ openingText, title }: HeroSectionProps) {
  return (
    <section className="invitation-section invitation-hero py-20 px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-[var(--inv-accent)] text-3xl font-serif">❦</div>

        {openingText && (
          <p className="text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line">
            {openingText}
          </p>
        )}

        <h2 className="text-3xl md:text-5xl font-serif leading-tight">{title}</h2>

        <div className="w-24 h-px bg-[var(--inv-accent)] mx-auto" />
      </div>
    </section>
  );
}
