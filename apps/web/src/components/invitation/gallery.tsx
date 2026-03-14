'use client';

import { useState } from 'react';

interface MediaItem {
  id: string;
  url?: string;
  fileUrl?: string;
  purpose: string;
}

interface GallerySectionProps {
  media: MediaItem[];
}

export default function GallerySection({ media }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryMedia = media.filter((m) => m.purpose === 'GALLERY' || m.purpose === 'HERO');

  if (galleryMedia.length === 0) return null;

  return (
    <section className="invitation-section invitation-gallery py-16 px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-2xl mx-auto space-y-8">
        <h3 className="text-center text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Galeri Kami
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {galleryMedia.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img
                src={item.fileUrl || item.url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-70"
            onClick={() => setLightboxIndex(null)}
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              ‹
            </button>
          )}

          <img
            src={galleryMedia[lightboxIndex].fileUrl || galleryMedia[lightboxIndex].url}
            alt={`Gallery ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < galleryMedia.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl hover:opacity-70"
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
