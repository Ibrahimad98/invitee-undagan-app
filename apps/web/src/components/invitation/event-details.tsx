'use client';

import { formatDate, formatTime } from '@invitee/shared';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface InvitationEvent {
  eventName: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  venueAddress?: string;
  mapUrl?: string;
}

interface EventDetailsSectionProps {
  events: InvitationEvent[];
}

export default function EventDetailsSection({ events }: EventDetailsSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="invitation-section invitation-events px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-2xl mx-auto space-y-8 sm:space-y-12 w-full ${animClass(isVisible, 'fade-up')}`}>
        <SectionOrnament position="divider" className="mb-2" />
        <h3 className="text-center text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
          Detail Acara
        </h3>

        {events.map((event, index) => (
          <div key={index} className={`text-center space-y-4 p-6 rounded-2xl bg-[var(--inv-bg-primary)]/50 ${animClass(isVisible, 'fade-up', 150 + index * 200)}`}>
            <h4 className="text-xl font-serif text-[var(--inv-accent)]">{event.eventName}</h4>

            <div className="flex items-center justify-center gap-2 text-sm text-[var(--inv-text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.eventDate)}</span>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--inv-text-secondary)]">
                <Clock className="w-4 h-4" />
                <span>
                  {event.startTime && formatTime(event.startTime)}
                  {event.startTime && event.endTime && ' - '}
                  {event.endTime && formatTime(event.endTime)}
                  {!event.endTime && ' - Selesai'}
                </span>
              </div>
            )}

            {event.venueName && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-[var(--inv-accent)]" />
                  <span>{event.venueName}</span>
                </div>
                {event.venueAddress && (
                  <p className="text-xs text-[var(--inv-text-secondary)]">{event.venueAddress}</p>
                )}
              </div>
            )}

            {event.mapUrl && (
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 mt-4 border border-[var(--inv-accent)] text-[var(--inv-accent)] rounded-full text-sm hover:bg-[var(--inv-accent)] hover:text-[var(--inv-accent-text)] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Lihat Lokasi
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
