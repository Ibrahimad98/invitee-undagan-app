'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CoverScreen from '@/components/invitation/cover-screen';
import HeroSection from '@/components/invitation/hero-section';
import CountdownTimer from '@/components/invitation/countdown-timer';
import PersonProfileSection from '@/components/invitation/person-profile';
import EventDetailsSection from '@/components/invitation/event-details';
import GallerySection from '@/components/invitation/gallery';
import DigitalGiftSection from '@/components/invitation/digital-gift';
import ClosingSection from '@/components/invitation/closing-section';
import AnimatedBackground from '@/components/invitation/animated-bg';
import ThreeJSBackground from '@/components/invitation/threejs-bg';
import { GALLERY_SAMPLES } from '@/lib/gallery-samples';

const ANIMATED_THEMES = ['enchanted-garden', 'royal-blossom', 'celestial-garden'] as const;
type AnimatedTheme = 'enchanted-garden' | 'royal-blossom' | 'celestial-garden';
const THREEJS_THEMES = ['ethereal-bloom'] as const;

/* ─── Theme visual config — matches thumbnail SVGs ─── */
const THEME_CONFIG: Record<string, {
  frameBg: string;       // outer page background
  coverBg: string;       // cover screen gradient
  coverOverlay?: string; // pseudo-element pattern (CSS)
  accent: string;        // accent / heading color
  textPrimary: string;   // main text on cover
  textSecondary: string; // subtle text on cover
  borderColor: string;   // cover border decorations
  ornamentTop: string;   // SVG markup for top ornament
  ornamentBottom: string;// SVG markup for bottom ornament
}> = {
  'super-classic': {
    frameBg: '#1e1a12',
    coverBg: 'linear-gradient(135deg, #2c2418 0%, #3d3122 40%, #2c2418 100%)',
    accent: '#c9a84c',
    textPrimary: '#c9a84c',
    textSecondary: 'rgba(201,168,76,0.7)',
    borderColor: '#c9a84c',
    ornamentTop: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c"/></svg>`,
    ornamentBottom: `<svg width="32" height="32" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c" opacity="0.5"/></svg>`,
  },
  'simple-java': {
    frameBg: '#2e2416',
    coverBg: 'linear-gradient(135deg, #3b2f20, #5a4730, #3b2f20)',
    accent: '#8b6914',
    textPrimary: '#d4b254',
    textSecondary: 'rgba(212,178,84,0.65)',
    borderColor: '#8b6914',
    ornamentTop: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="#8b6914" opacity="0.7"/><path d="M30,4 L38,10 L30,16 L22,10Z" fill="none" stroke="#8b6914" stroke-width="1.2"/><path d="M50,2 L60,10 L50,18 L40,10Z" fill="#8b6914" opacity="0.7"/></svg>`,
    ornamentBottom: `<svg width="40" height="24" viewBox="0 0 40 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="#8b6914" opacity="0.4"/><path d="M30,2 L40,10 L30,18 L20,10Z" fill="#8b6914" opacity="0.4"/></svg>`,
  },
  'golden-elegance': {
    frameBg: '#080806',
    coverBg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1508 50%, #0d0d0d 100%)',
    accent: '#d4a843',
    textPrimary: '#d4a843',
    textSecondary: 'rgba(212,168,67,0.7)',
    borderColor: '#d4a843',
    ornamentTop: `<svg width="44" height="44" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#d4a843"/></svg>`,
    ornamentBottom: `<svg width="36" height="36" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#d4a843" opacity="0.6"/></svg>`,
  },
  'royal-muslim': {
    frameBg: '#142218',
    coverBg: 'linear-gradient(160deg, #1d3225, #264d35, #1d3225)',
    accent: '#2d6a4f',
    textPrimary: '#c9a84c',
    textSecondary: 'rgba(201,168,76,0.65)',
    borderColor: '#2d6a4f',
    ornamentTop: `<svg width="48" height="48" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.6"/><polygon points="12,3 14,8 19,8 15,12 16.5,17 12,14 7.5,17 9,12 5,8 10,8" fill="#2d6a4f" opacity="0.12"/></svg>`,
    ornamentBottom: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="#2d6a4f" stroke-width="1" opacity="0.35"/></svg>`,
  },
  'kids-party': {
    frameBg: '#3d2d6b',
    coverBg: 'linear-gradient(135deg, #6c5ce7, #fd79a8 40%, #fdcb6e 80%)',
    accent: '#ff6b35',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.8)',
    borderColor: '#ff6b35',
    ornamentTop: `<svg width="36" height="44" viewBox="0 0 28 28"><path d="M14,2 L19,20 L9,20Z" fill="#ff6b35" opacity="0.8"/><circle cx="14" cy="2" r="2.5" fill="#feca57"/><line x1="14" y1="2" x2="8" y2="8" stroke="#48dbfb" stroke-width="1"/><line x1="14" y1="2" x2="20" y2="8" stroke="#ff9ff3" stroke-width="1"/><line x1="14" y1="2" x2="14" y2="10" stroke="#feca57" stroke-width="1"/></svg>`,
    ornamentBottom: `<svg width="60" height="16" viewBox="0 0 60 12"><circle cx="10" cy="6" r="4" fill="#ff6b6b" opacity="0.6"/><circle cx="30" cy="6" r="5" fill="#feca57" opacity="0.7"/><circle cx="50" cy="6" r="4" fill="#48dbfb" opacity="0.6"/></svg>`,
  },
  'wayang-heritage': {
    frameBg: '#1e1610',
    coverBg: 'linear-gradient(145deg, #2a1f14, #3d2d1a 50%, #2a1f14)',
    accent: '#8b4513',
    textPrimary: '#d4a86a',
    textSecondary: 'rgba(212,168,106,0.65)',
    borderColor: '#8b4513',
    ornamentTop: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L18,10 L10,18 L2,10Z" fill="none" stroke="#8b4513" stroke-width="1.5" opacity="0.5"/><path d="M30,4 L36,10 L30,16 L24,10Z" fill="#8b4513" opacity="0.15"/><path d="M50,2 L58,10 L50,18 L42,10Z" fill="none" stroke="#8b4513" stroke-width="1.5" opacity="0.5"/></svg>`,
    ornamentBottom: `<svg width="40" height="16" viewBox="0 0 40 16"><path d="M20,2 L28,8 L20,14 L12,8Z" fill="none" stroke="#8b4513" stroke-width="1.2" opacity="0.4"/></svg>`,
  },
  'modern-minimal': {
    frameBg: '#111111',
    coverBg: '#1a1a1a',
    accent: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.1)',
    ornamentTop: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/></svg>`,
    ornamentBottom: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/></svg>`,
  },
  'floral-garden': {
    frameBg: '#3a1a28',
    coverBg: 'linear-gradient(160deg, #4a2332, #6b3a4e 40%, #4a2332)',
    accent: '#d4688e',
    textPrimary: '#f9e8ed',
    textSecondary: 'rgba(249,232,237,0.7)',
    borderColor: '#d4688e',
    ornamentTop: `<svg width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3.5" fill="#d4688e" opacity="0.8"/><circle cx="5" cy="11" r="3.5" fill="#d4688e" opacity="0.7"/><circle cx="19" cy="11" r="3.5" fill="#d4688e" opacity="0.7"/><circle cx="8" cy="19" r="3.5" fill="#d4688e" opacity="0.6"/><circle cx="16" cy="19" r="3.5" fill="#d4688e" opacity="0.6"/><circle cx="12" cy="11" r="2.5" fill="#f9e8ed"/></svg>`,
    ornamentBottom: `<svg width="36" height="36" viewBox="0 0 32 32"><path d="M16 4c3 4 8 6 12 6-2 4-2 9 0 13-4 0-9 2-12 6-3-4-8-6-12-6 2-4 2-9 0-13 4 0 9-2 12-6z" fill="#d4688e" opacity="0.15"/><circle cx="16" cy="16" r="4" fill="#d4688e" opacity="0.12"/></svg>`,
  },
  'christmas-joy': {
    frameBg: '#121e16',
    coverBg: 'linear-gradient(160deg, #1a3c2a, #2d1b1b 60%, #1a3c2a)',
    accent: '#c0392b',
    textPrimary: '#f0e6d0',
    textSecondary: 'rgba(240,230,208,0.65)',
    borderColor: '#c0392b',
    ornamentTop: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="#c0392b" opacity="0.5"/></svg>`,
    ornamentBottom: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="#27ae60" opacity="0.35"/></svg>`,
  },
  'slide-romantic': {
    frameBg: '#2e1620',
    coverBg: 'linear-gradient(135deg, #3d1e28, #5c2f3e 40%, #3d1e28)',
    accent: '#e8758a',
    textPrimary: '#fef6f4',
    textSecondary: 'rgba(254,246,244,0.7)',
    borderColor: '#e8758a',
    ornamentTop: `<svg width="40" height="36" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="#e8758a" opacity="0.25"/></svg>`,
    ornamentBottom: `<svg width="32" height="28" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="#e8758a" opacity="0.15"/></svg>`,
  },
  'enchanted-garden': {
    frameBg: '#e8e0d4',
    coverBg: 'linear-gradient(160deg, #faf6f0 0%, #ede6d8 50%, #faf6f0 100%)',
    accent: '#7d8c6e',
    textPrimary: '#3a3530',
    textSecondary: 'rgba(58, 53, 48, 0.65)',
    borderColor: '#7d8c6e',
    ornamentTop: `<svg width="60" height="32" viewBox="0 0 80 40"><path d="M5,38 C5,15 20,5 40,5 C60,5 75,15 75,38" fill="none" stroke="#7d8c6e" stroke-width="1.2" opacity="0.5"/><ellipse cx="15" cy="22" rx="6" ry="3" transform="rotate(-30 15 22)" fill="#7d8c6e" opacity="0.3"/><ellipse cx="65" cy="22" rx="6" ry="3" transform="rotate(30 65 22)" fill="#7d8c6e" opacity="0.3"/><circle cx="40" cy="5" r="2" fill="#7d8c6e" opacity="0.4"/></svg>`,
    ornamentBottom: `<svg width="40" height="8" viewBox="0 0 60 8"><path d="M0,4 Q15,0 30,4 Q45,8 60,4" fill="none" stroke="#7d8c6e" stroke-width="0.8" opacity="0.3"/></svg>`,
  },
  'royal-blossom': {
    frameBg: '#120a0e',
    coverBg: 'radial-gradient(ellipse at 50% 40%, #2a1822 0%, #1a0f14 70%)',
    accent: '#d4a373',
    textPrimary: '#f2e8e0',
    textSecondary: 'rgba(242, 232, 224, 0.55)',
    borderColor: '#d4a373',
    ornamentTop: `<svg width="36" height="36" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#d4a373" stroke-width="0.8" opacity="0.3"/><circle cx="20" cy="20" r="10" fill="none" stroke="#d4a373" stroke-width="0.6" opacity="0.2"/><ellipse cx="20" cy="13" rx="5" ry="3" fill="#d4a373" opacity="0.25"/><ellipse cx="14" cy="20" rx="5" ry="3" transform="rotate(72 14 20)" fill="#d4a373" opacity="0.2"/><ellipse cx="26" cy="20" rx="5" ry="3" transform="rotate(-72 26 20)" fill="#d4a373" opacity="0.2"/><circle cx="20" cy="20" r="3" fill="#d4a373" opacity="0.35"/></svg>`,
    ornamentBottom: `<svg width="28" height="28" viewBox="0 0 32 32"><path d="M16 4c3 4 8 6 12 6-2 4-2 9 0 13-4 0-9 2-12 6-3-4-8-6-12-6 2-4 2-9 0-13 4 0 9-2 12-6z" fill="#d4a373" opacity="0.12"/><circle cx="16" cy="16" r="3" fill="#d4a373" opacity="0.2"/></svg>`,
  },
  'celestial-garden': {
    frameBg: '#061210',
    coverBg: 'radial-gradient(ellipse at 50% 35%, #0e2016 0%, #0a1a12 70%)',
    accent: '#4ecdc4',
    textPrimary: '#e0f0e8',
    textSecondary: 'rgba(224, 240, 232, 0.5)',
    borderColor: '#4ecdc4',
    ornamentTop: `<svg width="56" height="30" viewBox="0 0 70 36"><path d="M5,34 C5,14 18,5 35,5 C52,5 65,14 65,34" fill="none" stroke="#4ecdc4" stroke-width="0.8" opacity="0.35"/><ellipse cx="14" cy="22" rx="5" ry="2" transform="rotate(-40 14 22)" fill="#4ecdc4" opacity="0.2"/><ellipse cx="56" cy="22" rx="5" ry="2" transform="rotate(40 56 22)" fill="#4ecdc4" opacity="0.2"/><circle cx="25" cy="12" r="2" fill="#4ecdc4" opacity="0.3"/><circle cx="45" cy="12" r="1.5" fill="#4ecdc4" opacity="0.25"/><circle cx="35" cy="6" r="1.8" fill="#4ecdc4" opacity="0.35"/></svg>`,
    ornamentBottom: `<svg width="40" height="8" viewBox="0 0 60 8"><path d="M0,4 Q10,1 20,4 Q30,7 40,4 Q50,1 60,4" fill="none" stroke="#4ecdc4" stroke-width="0.6" opacity="0.25"/></svg>`,
  },
  'ethereal-bloom': {
    frameBg: '#0a0e1a',
    coverBg: 'radial-gradient(ellipse at 50% 35%, rgba(18, 16, 34, 0.90) 0%, rgba(10, 14, 26, 0.96) 70%)',
    accent: '#b8a9d4',
    textPrimary: '#e8e4f0',
    textSecondary: 'rgba(232, 228, 240, 0.5)',
    borderColor: '#b8a9d4',
    ornamentTop: `<svg width="52" height="28" viewBox="0 0 64 34"><path d="M4,32 C4,14 16,5 32,5 C48,5 60,14 60,32" fill="none" stroke="#b8a9d4" stroke-width="0.7" opacity="0.3"/><circle cx="16" cy="16" r="3" fill="#b8a9d4" opacity="0.25"/><circle cx="32" cy="8" r="2.5" fill="#d4a0a0" opacity="0.3"/><circle cx="48" cy="16" r="3" fill="#b8a9d4" opacity="0.25"/></svg>`,
    ornamentBottom: `<svg width="40" height="8" viewBox="0 0 60 8"><path d="M0,4 Q15,1 30,4 Q45,7 60,4" fill="none" stroke="#b8a9d4" stroke-width="0.5" opacity="0.2"/></svg>`,
  },
};

function getThemeConfig(slug: string) {
  return THEME_CONFIG[slug] || THEME_CONFIG['super-classic'];
}

// Sample preview data for all templates
function getSampleData(slug: string) {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  const dateStr = futureDate.toISOString().split('T')[0];

  // Gallery samples served from S3 via presigned URLs
  const galleryImages = GALLERY_SAMPLES;

  return {
    title: 'Pernikahan Budi & Ani',
    openingText: 'Bismillahirrahmanirrahim\n\nAssalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon rahmat dan ridha Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada acara pernikahan kami.',
    closingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.\n\nAtas kehadiran dan doa restunya, kami ucapkan terima kasih.\n\nWassalamualaikum Warahmatullahi Wabarakatuh',
    guestName: 'Tamu Undangan',
    eventDate: futureDate,
    personProfiles: [
      {
        fullName: 'Budi Santoso',
        nickname: 'Budi',
        photoUrl: '',
        parentFather: 'H. Ahmad Santoso',
        parentMother: 'Hj. Siti Rahayu',
        childOrder: 'Putra Kedua',
        role: 'Groom',
      },
      {
        fullName: 'Ani Widya',
        nickname: 'Ani',
        photoUrl: '',
        parentFather: 'Ir. Widodo',
        parentMother: 'Dr. Sri Wahyuni',
        childOrder: 'Putri Pertama',
        role: 'Bride',
      },
    ],
    events: [
      {
        eventName: 'Akad Nikah',
        eventDate: dateStr,
        startTime: '08:00',
        endTime: '10:00',
        venueName: 'Masjid Agung Al-Azhar',
        venueAddress: 'Jl. Sisingamangaraja No.Kav.18, Jakarta Selatan',
        mapUrl: 'https://maps.google.com',
      },
      {
        eventName: 'Resepsi',
        eventDate: dateStr,
        startTime: '11:00',
        endTime: '14:00',
        venueName: 'Hotel Grand Ballroom',
        venueAddress: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
        mapUrl: 'https://maps.google.com',
      },
    ],
    media: galleryImages.map((url, i) => ({
      id: `preview-${i}`,
      url,
      fileUrl: url,
      purpose: 'GALLERY',
    })),
    giftAccounts: [
      {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '1234567890',
        accountHolder: 'Budi Santoso',
      },
      {
        bankName: 'Bank Mandiri',
        accountNumber: '0987654321',
        accountHolder: 'Ani Widya',
      },
    ],
    coInvitors: [
      { name: 'Keluarga Besar Santoso', role: 'Keluarga Mempelai Pria' },
      { name: 'Keluarga Besar Widodo', role: 'Keluarga Mempelai Wanita' },
    ],
  };
}

export default function TemplatePreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
          <img src="/favicon.svg" alt="Invitee" className="absolute w-7 h-7" />
        </div>
      </div>
    );
  }

  const themeClass = `theme-${slug}`;
  const sample = getSampleData(slug);
  const themeConf = getThemeConfig(slug);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: themeConf.frameBg }}>
      {/* Preview Banner */}
      <div className="text-white text-center py-2.5 px-4 text-xs sm:text-sm flex items-center justify-center gap-3 shrink-0" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <span className="opacity-60">Mode Preview</span>
        <span className="inline-block w-1 h-1 rounded-full bg-gray-500" />
        <span className="font-medium capitalize">{slug.replace(/-/g, ' ')}</span>
        <span className="inline-block w-1 h-1 rounded-full bg-gray-500" />
        <a href="/templates" className="text-primary-400 hover:text-primary-300 transition-colors">← Kembali</a>
      </div>

      {/* Phone Frame Container */}
      <div className="flex-1 flex items-start justify-center py-4 sm:py-6 px-4 overflow-hidden">
        <div className="w-full max-w-[430px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 relative" style={{ height: 'calc(100vh - 56px)', maxHeight: '900px' }}>
          {/* Override fixed positioning within phone frame */}
          <style>{`
            .phone-frame .invitation-cover {
              position: absolute !important;
            }
            .phone-frame .invitation-content {
              height: 100% !important;
            }
            .phone-frame .invitation-section {
              min-height: 100% !important;
            }
          `}</style>
          <div className={`phone-frame invitation-root ${themeClass} h-full`} style={{ background: themeConf.frameBg }}>
            {/* Cover Screen */}
            {!isOpen && (
              <>
                {/* Animated background behind cover (premium themes) */}
                {ANIMATED_THEMES.includes(slug as any) && (
                  <AnimatedBackground
                    theme={slug as AnimatedTheme}
                    mode="cover"
                  />
                )}
                {/* Three.js GPU particle background (ethereal-bloom) */}
                {THREEJS_THEMES.includes(slug as any) && (
                  <ThreeJSBackground mode="cover" />
                )}
                <CoverScreen
                  title={sample.title}
                  guestName={sample.guestName}
                  eventDate={sample.eventDate}
                  onOpen={() => setIsOpen(true)}
                  themeConfig={themeConf}
                  eventType="WEDDING"
                />
              </>
            )}

            {/* Main Content */}
            {isOpen && (
              <main className="invitation-content">
                {/* Animated particle background — sticky inside scroll container (premium themes) */}
                {ANIMATED_THEMES.includes(slug as any) && (
                  <AnimatedBackground
                    theme={slug as AnimatedTheme}
                    mode="content"
                  />
                )}
                {/* Three.js GPU particle background — sticky inside scroll container */}
                {THREEJS_THEMES.includes(slug as any) && (
                  <ThreeJSBackground mode="content" />
                )}
                <HeroSection
                  openingText={sample.openingText}
                  title={sample.title}
                  eventType="WEDDING"
                />

                <PersonProfileSection profiles={sample.personProfiles} eventType="WEDDING" />

                <CountdownTimer targetDate={sample.eventDate} />

                <EventDetailsSection events={sample.events} />

                <GallerySection media={sample.media} />

                <DigitalGiftSection accounts={sample.giftAccounts} />

                <ClosingSection
                  closingText={sample.closingText}
                  coInvitors={sample.coInvitors}
                />
              </main>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
