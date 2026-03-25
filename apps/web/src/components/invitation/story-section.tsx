'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface StorySectionProps {
  story: string;
  eventType?: string;
}

const STORY_TITLES: Record<string, string> = {
  WEDDING: 'Kisah Cinta Kami',
  ENGAGEMENT: 'Perjalanan Kami',
  ANNIVERSARY: 'Kisah Kami',
  KHITANAN: 'Cerita Si Kecil',
  BIRTHDAY: 'Tentang Saya',
  AQIQAH: 'Cerita Kebahagiaan',
  GRADUATION: 'Perjalanan Studi',
  REUNION: 'Tentang Kami',
  CORPORATE: 'Latar Belakang',
  SYUKURAN: 'Kisah Perjalanan',
  WALIMAH: 'Kisah Cinta Kami',
  CUSTOM: 'Cerita Kami',
};

export default function StorySection({ story, eventType }: StorySectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  if (!story || !story.trim()) return null;

  const title = STORY_TITLES[eventType || 'WEDDING'] || 'Cerita Kami';

  // Split by double newline for paragraphs
  const paragraphs = story.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <section
      ref={ref}
      className="invitation-section invitation-story px-8 sm:px-12 py-14 sm:py-16 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]"
    >
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>

        <div className="text-center space-y-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
            {title}
          </h3>
        </div>

        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line text-center ${animClass(isVisible, 'fade-up', 150 * (index + 1))}`}
            >
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
