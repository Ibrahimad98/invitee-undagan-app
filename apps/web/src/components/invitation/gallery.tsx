'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface MediaItem {
  id: string;
  url?: string;
  fileUrl?: string;
  purpose: string;
}

interface GallerySectionProps {
  media: MediaItem[];
}

const GALLERY_FALLBACKS = [
  '/images/gallery/sample-1.jpg',
  '/images/gallery/sample-2.jpg',
  '/images/gallery/sample-3.jpg',
  '/images/gallery/sample-4.jpg',
  '/images/gallery/sample-5.jpg',
  '/images/gallery/sample-6.jpg',
];

export default function GallerySection({ media }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const galleryMedia = media.filter((m) => m.purpose === 'GALLERY' || m.purpose === 'HERO');

  const total = galleryMedia.length;

  const goTo = useCallback((index: number) => {
    const next = ((index % total) + total) % total;
    setCurrent(next);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (total <= 1) return;
    autoplayRef.current = setInterval(() => goTo(current + 1), 4000);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [current, total, goTo]);

  // Touch/swipe support
  const touchStart = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  };

  if (galleryMedia.length === 0) return null;

  const getImageSrc = (item: MediaItem) => item.fileUrl || item.url || '';

  return (
    <section className="invitation-section invitation-gallery py-10 sm:py-16 px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <h3 className="text-center text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Galeri Kami
        </h3>

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {galleryMedia.map((item, index) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 aspect-[4/3] relative cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={getImageSrc(item)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const fallback = GALLERY_FALLBACKS[index % GALLERY_FALLBACKS.length];
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = fallback;
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={() => goTo(current - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => goTo(current + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {galleryMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current
                      ? 'bg-white w-5'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {galleryMedia.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goTo(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  index === current
                    ? 'ring-2 ring-[var(--inv-accent)] opacity-100'
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={getImageSrc(item)}
                  alt={`Thumb ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const fallback = GALLERY_FALLBACKS[index % GALLERY_FALLBACKS.length];
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = fallback;
                    }
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-70 z-10"
            onClick={() => setLightboxIndex(null)}
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-4xl hover:opacity-70 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              ‹
            </button>
          )}

          <img
            src={getImageSrc(galleryMedia[lightboxIndex])}
            alt={`Gallery ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const fallback = GALLERY_FALLBACKS[lightboxIndex % GALLERY_FALLBACKS.length];
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = fallback;
              }
            }}
          />

          {lightboxIndex < galleryMedia.length - 1 && (
            <button
              className="absolute right-4 text-white text-4xl hover:opacity-70 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              ›
            </button>
          )}

          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {galleryMedia.length}
          </div>
        </div>
      )}
    </section>
  );
}
