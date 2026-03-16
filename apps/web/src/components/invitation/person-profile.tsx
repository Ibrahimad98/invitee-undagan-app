'use client';

import { useState } from 'react';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';
import { getEventTypeConfig } from '@/lib/event-type-config';

interface PersonProfile {
  fullName: string;
  nickname?: string;
  photoUrl?: string;
  parentFather?: string;
  parentMother?: string;
  childOrder?: string;
  role: string;
  instagram?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  age?: string;
  jobTitle?: string;
  organization?: string;
}

interface PersonProfileSectionProps {
  profiles: PersonProfile[];
  eventType?: string;
}

function ProfilePhoto({ profile }: { profile: PersonProfile }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = profile.fullName.charAt(0).toUpperCase();

  const showFallback = !profile.photoUrl || imgFailed;

  return (
    <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--inv-accent)] bg-[var(--inv-bg-secondary)]">
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect width="80" height="80" fill="var(--inv-bg-secondary)" />
            <circle cx="40" cy="30" r="14" fill="var(--inv-accent)" opacity="0.2" />
            <ellipse cx="40" cy="62" rx="20" ry="14" fill="var(--inv-accent)" opacity="0.15" />
            <text x="40" y="45" textAnchor="middle" fontSize="28" fontFamily="serif" fill="var(--inv-accent)" opacity="0.6">{initial}</text>
          </svg>
        </div>
      ) : (
        <img
          src={profile.photoUrl}
          alt={profile.fullName}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

export default function PersonProfileSection({ profiles, eventType }: PersonProfileSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const config = getEventTypeConfig(eventType || 'WEDDING');

  return (
    <section ref={ref} className="invitation-section invitation-profiles px-4 sm:px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className="max-w-2xl mx-auto w-full">
        <div className={`grid ${profiles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-8 sm:gap-12`}>
          {profiles.map((profile, index) => (
            <div key={index} className={`text-center space-y-3 sm:space-y-4 ${animClass(isVisible, index === 0 ? 'fade-right' : 'fade-left', index * 200)}`}>
              {/* Photo */}
              <ProfilePhoto profile={profile} />

              {/* Name */}
              <h3 className="text-xl sm:text-2xl font-serif">{profile.fullName}</h3>

              {/* Job Title & Organization (for CORPORATE/GRADUATION) */}
              {(profile.jobTitle || profile.organization) && (
                <p className="text-sm text-[var(--inv-text-secondary)]">
                  {profile.jobTitle && profile.organization
                    ? `${profile.jobTitle} — ${profile.organization}`
                    : profile.jobTitle || profile.organization}
                </p>
              )}

              {/* Child Order */}
              {profile.childOrder && (
                <p className="text-sm text-[var(--inv-text-secondary)]">{profile.childOrder}</p>
              )}

              {/* Age / Date of Birth */}
              {(profile.age || profile.dateOfBirth) && (
                <p className="text-sm text-[var(--inv-text-secondary)]">
                  {profile.age && profile.dateOfBirth
                    ? `${profile.age} • ${profile.dateOfBirth}`
                    : profile.age || profile.dateOfBirth}
                </p>
              )}

              {/* Parents — only show when config says so */}
              {config.showParents && (profile.parentFather || profile.parentMother) && (
                <p className="text-sm text-[var(--inv-text-secondary)]">
                  {profile.parentFather && profile.parentMother
                    ? `Putra/i dari Bpk. ${profile.parentFather} & Ibu ${profile.parentMother}`
                    : profile.parentFather
                      ? `Putra/i dari Bpk. ${profile.parentFather}`
                      : `Putra/i dari Ibu ${profile.parentMother}`}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-[var(--inv-text-secondary)] italic">{profile.bio}</p>
              )}

              {/* Instagram */}
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--inv-accent)] hover:underline"
                >
                  📷 {profile.instagram}
                </a>
              )}

              {/* Ampersand between profiles — only for event types that use it */}
              {config.showAmpersand && index === 0 && profiles.length > 1 && (
                <div className="md:hidden text-4xl font-serif text-[var(--inv-accent)] py-4">
                  &
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ampersand for desktop between columns — only for event types that use it */}
        {config.showAmpersand && profiles.length === 2 && (
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-serif text-[var(--inv-accent)]">
            &
          </div>
        )}
      </div>
    </section>
  );
}
