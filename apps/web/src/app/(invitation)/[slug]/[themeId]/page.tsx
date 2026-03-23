'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useInvitationPublic } from '@/hooks/queries/use-invitations';
import CoverScreen from '@/components/invitation/cover-screen';
import HeroSection from '@/components/invitation/hero-section';
import CountdownTimer from '@/components/invitation/countdown-timer';
import PersonProfileSection from '@/components/invitation/person-profile';
import EventDetailsSection from '@/components/invitation/event-details';
import GallerySection from '@/components/invitation/gallery';
import RsvpFormSection from '@/components/invitation/rsvp-form';
import WishesListSection from '@/components/invitation/wishes-list';
import DigitalGiftSection from '@/components/invitation/digital-gift';
import ClosingSection from '@/components/invitation/closing-section';
import StorySection from '@/components/invitation/story-section';
import AudioPlayer from '@/components/invitation/audio-player';
import AnimatedBackground from '@/components/invitation/animated-bg';
import ThreeJSBackground from '@/components/invitation/threejs-bg';

const ANIMATED_THEMES = ['theme-enchanted-garden', 'theme-royal-blossom', 'theme-celestial-garden'] as const;
type AnimatedTheme = 'enchanted-garden' | 'royal-blossom' | 'celestial-garden';
const THREEJS_THEMES = ['theme-ethereal-bloom'] as const;

/* ─── Dark outer-frame background per theme (matches preview THEME_CONFIG.frameBg) ─── */
const FRAME_BG: Record<string, string> = {
  'theme-super-classic': '#1e1a12',
  'theme-simple-java': '#2e2416',
  'theme-golden-elegance': '#080806',
  'theme-royal-muslim': '#142218',
  'theme-kids-party': '#3d2d6b',
  'theme-wayang-heritage': '#1e1610',
  'theme-modern-minimal': '#111111',
  'theme-floral-garden': '#3a1a28',
  'theme-christmas-joy': '#121e16',
  'theme-slide-romantic': '#2e1620',
  'theme-enchanted-garden': '#e8e0d4',
  'theme-royal-blossom': '#120a0e',
  'theme-celestial-garden': '#061210',
  'theme-ethereal-bloom': '#0a0e1a',
};

export default function InvitationPreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const themeId = (params.themeId as string) || 'default';
  const guestName = searchParams.get('kpd') || 'Tamu Undangan';

  const { data: invitation, isLoading, error } = useInvitationPublic(slug);
  const autoOpen = searchParams.get('autoOpen') === '1';
  const autoPrint = searchParams.get('print') === '1';
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [showPromo, setShowPromo] = useState(false);

  // Show beta promo popup after guest has been viewing for 8 seconds (once per day)
  useEffect(() => {
    if (autoPrint) return; // Don't show on PDF prints
    const PROMO_KEY = 'invitee_promo_seen';
    const lastSeen = localStorage.getItem(PROMO_KEY);
    if (lastSeen) {
      const diff = Date.now() - parseInt(lastSeen, 10);
      if (diff < 24 * 60 * 60 * 1000) return; // Already shown within 24h
    }
    const timer = setTimeout(() => {
      setShowPromo(true);
      localStorage.setItem(PROMO_KEY, Date.now().toString());
    }, 8000);
    return () => clearTimeout(timer);
  }, [autoPrint]);

  const dismissPromo = useCallback(() => setShowPromo(false), []);

  // Auto-print after content loads (for PDF download)
  useEffect(() => {
    if (autoPrint && autoOpen && invitation && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, autoOpen, invitation, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
          <img src="/favicon.svg" alt="Invitee" className="absolute w-7 h-7" />
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <p className="text-6xl">💌</p>
          <h1 className="text-2xl font-bold text-gray-800">Undangan Tidak Ditemukan</h1>
          <p className="text-gray-500">Link undangan tidak valid atau sudah kadaluarsa.</p>
        </div>
      </div>
    );
  }

  const firstEvent = invitation.events?.[0];
  const eventDate = firstEvent?.eventDate ? new Date(firstEvent.eventDate) : null;

  // Get the template's cssClass from the invitation data, fallback to URL themeId
  const templateCssClass = invitation.templates?.[0]?.template?.cssClass;
  const themeClass = templateCssClass || `theme-${themeId}`;
  const frameBg = FRAME_BG[themeClass] || '#1e1a12';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: frameBg }}>
      {/* Phone Frame Container — same layout as preview */}
      <div className="flex-1 flex items-start justify-center py-4 sm:py-6 px-4 overflow-hidden">
        <div
          className="w-full max-w-[430px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 relative"
          style={{ height: 'calc(100vh - 32px)', maxHeight: '900px' }}
        >
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
            .phone-frame .invitation-section.invitation-story {
              min-height: auto !important;
            }
          `}</style>

          <div className={`phone-frame invitation-root ${themeClass} h-full`} style={{ background: frameBg }}>
            {/* Audio Player */}
            {invitation.musicUrl && <AudioPlayer src={invitation.musicUrl} />}

            {/* Cover Screen */}
            {!isOpen && (
              <>
                {/* Animated background behind cover (premium themes) */}
                {ANIMATED_THEMES.includes(themeClass as any) && (
                  <AnimatedBackground
                    theme={themeClass.replace('theme-', '') as AnimatedTheme}
                    mode="cover"
                  />
                )}
                {/* Three.js GPU particle background (ethereal-bloom) */}
                {THREEJS_THEMES.includes(themeClass as any) && (
                  <ThreeJSBackground mode="cover" />
                )}
                <CoverScreen
                  title={invitation.title}
                  guestName={guestName}
                  eventDate={eventDate}
                  onOpen={() => setIsOpen(true)}
                  eventType={invitation.eventType}
                />
              </>
            )}

            {/* Main Content — scroll-snap container */}
            {isOpen && (
              <main className="invitation-content">
                {/* Animated particle background — sticky inside scroll container (premium themes) */}
                {ANIMATED_THEMES.includes(themeClass as any) && (
                  <AnimatedBackground
                    theme={themeClass.replace('theme-', '') as AnimatedTheme}
                    mode="content"
                  />
                )}
                {/* Three.js GPU particle background — sticky inside scroll container */}
                {THREEJS_THEMES.includes(themeClass as any) && (
                  <ThreeJSBackground mode="content" />
                )}
                {/* Hero / Opening */}
                <HeroSection
                  openingText={invitation.openingText}
                  title={invitation.title}
                  eventType={invitation.eventType}
                />

                {/* Person Profiles */}
                {invitation.personProfiles && invitation.personProfiles.length > 0 && (
                  <PersonProfileSection profiles={invitation.personProfiles} eventType={invitation.eventType} />
                )}

                {/* Story / Background (optional) */}
                {invitation.story && (
                  <StorySection story={invitation.story} eventType={invitation.eventType} />
                )}

                {/* Countdown */}
                {eventDate && <CountdownTimer targetDate={eventDate} />}

                {/* Event Details */}
                {invitation.events && invitation.events.length > 0 && (
                  <EventDetailsSection events={invitation.events} />
                )}

                {/* Gallery */}
                {invitation.media && invitation.media.length > 0 && (
                  <GallerySection media={invitation.media} />
                )}

                {/* Digital Gift */}
                {invitation.giftAccounts && invitation.giftAccounts.length > 0 && (
                  <DigitalGiftSection accounts={invitation.giftAccounts} />
                )}

                {/* RSVP */}
                <RsvpFormSection invitationId={invitation.id} guestName={guestName} />

                {/* Wishes */}
                <WishesListSection invitationId={invitation.id} />

                {/* Closing */}
                <ClosingSection
                  closingText={invitation.closingText}
                  coInvitors={invitation.coInvitors}
                />
              </main>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Beta Promo Popup ═══ */}
      {showPromo && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 relative animate-in slide-in-from-bottom-4 duration-500">
            {/* Close button */}
            <button
              onClick={dismissPromo}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="text-center">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💌</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Buat Undangan Digital Anda!
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Suka dengan undangan ini? Anda juga bisa buat undangan digital <strong className="text-primary-600">gratis</strong> untuk acara Anda.
              </p>

              {/* Beta highlight */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-sm mb-4">
                <p className="font-semibold text-amber-800 mb-1.5 flex items-center gap-1.5">
                  <span>🧪</span> Fase Beta — Semua GRATIS!
                </p>
                <ul className="text-amber-700 space-y-1 text-xs">
                  <li className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✓</span> Daftar gratis tanpa kartu kredit</li>
                  <li className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✓</span> Buat undangan digital dengan template premium</li>
                  <li className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✓</span> Request akses Premium gratis selama beta</li>
                  <li className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✓</span> Hingga 2000 tamu dengan fitur lengkap</li>
                </ul>
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                <Link
                  href="/register"
                  className="block w-full py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors text-center"
                >
                  Daftar Gratis Sekarang
                </Link>
                <button
                  onClick={dismissPromo}
                  className="block w-full py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
