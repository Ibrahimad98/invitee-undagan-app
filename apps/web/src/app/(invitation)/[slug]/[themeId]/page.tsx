'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useInvitationPublic } from '@/hooks/queries/use-invitations';
import { Skeleton } from '@/components/ui/skeleton';
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
import AudioPlayer from '@/components/invitation/audio-player';

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

  return (
    <div className={`invitation-root ${themeClass}`}>
      {/* Audio Player */}
      {invitation.musicUrl && <AudioPlayer src={invitation.musicUrl} />}

      {/* Cover Screen */}
      {!isOpen && (
        <CoverScreen
          title={invitation.title}
          guestName={guestName}
          eventDate={eventDate}
          onOpen={() => setIsOpen(true)}
        />
      )}

      {/* Main Content — scroll-snap container */}
      {isOpen && (
        <main className="invitation-content">
          {/* Hero / Opening */}
          <HeroSection
            openingText={invitation.openingText}
            title={invitation.title}
          />

          {/* Person Profiles */}
          {invitation.personProfiles && invitation.personProfiles.length > 0 && (
            <PersonProfileSection profiles={invitation.personProfiles} />
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
  );
}
