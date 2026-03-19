'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
};

export default function InvitationPreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const themeId = (params.themeId as string) || 'default';
  const guestName = searchParams.get('kpd') || 'Tamu Undangan';

  const { data: invitation, isLoading, error } = useInvitationPublic(slug);
  const [isOpen, setIsOpen] = useState(false);

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
              <CoverScreen
                title={invitation.title}
                guestName={guestName}
                eventDate={eventDate}
                onOpen={() => setIsOpen(true)}
                eventType={invitation.eventType}
              />
            )}

            {/* Main Content — scroll-snap container */}
            {isOpen && (
              <main className="invitation-content">
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
    </div>
  );
}
