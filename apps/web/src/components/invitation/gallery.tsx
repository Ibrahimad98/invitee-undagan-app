'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';
import { GALLERY_SAMPLES } from '@/lib/gallery-samples';

interface MediaItem {
  id: string;
  url?: string;
  fileUrl?: string;
  purpose: string;
}

interface GallerySectionProps {
  media: MediaItem[];
}

const GALLERY_FALLBACKS = GALLERY_SAMPLES;

/* ── Lightbox rendered via React Portal so it escapes the phone-frame ── */
function Lightbox({
  src,
  alt,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Previous */}
      {index > 0 && (
        <button
          className="absolute left-3 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-2xl"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="relative z-10 max-w-[92%] max-h-[85vh] object-contain rounded-xl shadow-2xl animate-[gallery-zoom-in_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          const fallback = GALLERY_FALLBACKS[index % GALLERY_FALLBACKS.length];
          if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = fallback; }
        }}
      />

      {/* Next */}
      {index < total - 1 && (
        <button
          className="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-2xl"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          ›
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-5 z-10 text-white/70 text-xs tracking-wider">
        {index + 1} / {total}
      </div>

      <style>{`
        @keyframes gallery-zoom-in {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default function GallerySection({ media }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const galleryMedia = media.filter((m) => m.purpose === 'GALLERY' || m.purpose === 'HERO');

  if (galleryMedia.length === 0) return null;

  const getImageSrc = (item: MediaItem) => item.fileUrl || item.url || '';

  // Determine collage grid columns based on image count
  const getCollageClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  // Span logic for visual variety in collage
  const getItemClass = (index: number, total: number) => {
    if (total === 1) return 'col-span-1 aspect-[4/3]';
    if (total === 2) return 'col-span-1 aspect-square';
    if (total === 3) {
      return index === 0 ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square';
    }
    if (total === 4) return 'col-span-1 aspect-square';
    if (total === 5) {
      return index < 2 ? 'col-span-1 aspect-[4/3]' : 'col-span-1 aspect-square';
    }
    // 6+: first image large
    if (index === 0) return 'col-span-2 row-span-2 aspect-square';
    return 'col-span-1 aspect-square';
  };

  return (
    <section ref={sectionRef} className="invitation-section invitation-gallery px-8 sm:px-12 py-14 sm:py-16 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <h3 className="text-center text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Galeri Kami
        </h3>

        {/* Collage Grid */}
        <div className={`grid ${getCollageClass(galleryMedia.length)} gap-1.5 sm:gap-2`}>
          {galleryMedia.map((item, index) => (
            <div
              key={item.id}
              className={`${getItemClass(index, galleryMedia.length)} relative overflow-hidden rounded-lg cursor-pointer group ${animClass(isVisible, 'zoom-in', 80 * index)}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={getImageSrc(item)}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const fallback = GALLERY_FALLBACKS[index % GALLERY_FALLBACKS.length];
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = fallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox — rendered via portal to escape phone-frame */}
      {selectedIndex !== null && (
        <Lightbox
          src={getImageSrc(galleryMedia[selectedIndex])}
          alt={`Gallery ${selectedIndex + 1}`}
          index={selectedIndex}
          total={galleryMedia.length}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
          onNext={() => setSelectedIndex(Math.min(galleryMedia.length - 1, selectedIndex + 1))}
        />
      )}
    </section>
  );
}
