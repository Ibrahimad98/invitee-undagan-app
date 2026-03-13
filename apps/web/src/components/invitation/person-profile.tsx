'use client';

interface PersonProfile {
  fullName: string;
  nickname?: string;
  photoUrl?: string;
  parentFather?: string;
  parentMother?: string;
  childOrder?: string;
  role: string;
  instagram?: string;
}

interface PersonProfileSectionProps {
  profiles: PersonProfile[];
}

export default function PersonProfileSection({ profiles }: PersonProfileSectionProps) {
  return (
    <section className="invitation-section invitation-profiles py-16 px-8 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <div className="max-w-2xl mx-auto">
        <div className={`grid ${profiles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-12`}>
          {profiles.map((profile, index) => (
            <div key={index} className="text-center space-y-4">
              {/* Photo */}
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--inv-accent)] bg-[var(--inv-bg-secondary)]">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-[var(--inv-accent)]">
                    {profile.fullName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-2xl font-serif">{profile.fullName}</h3>

              {/* Child Order */}
              {profile.childOrder && (
                <p className="text-sm text-[var(--inv-text-secondary)]">{profile.childOrder}</p>
              )}

              {/* Parents */}
              {(profile.parentFather || profile.parentMother) && (
                <p className="text-sm text-[var(--inv-text-secondary)]">
                  {profile.parentFather && profile.parentMother
                    ? `Putra/i dari Bpk. ${profile.parentFather} & Ibu ${profile.parentMother}`
                    : profile.parentFather
                      ? `Putra/i dari Bpk. ${profile.parentFather}`
                      : `Putra/i dari Ibu ${profile.parentMother}`}
                </p>
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

              {/* Ampersand between profiles */}
              {index === 0 && profiles.length > 1 && (
                <div className="md:hidden text-4xl font-serif text-[var(--inv-accent)] py-4">
                  &
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ampersand for desktop between columns */}
        {profiles.length === 2 && (
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-serif text-[var(--inv-accent)]">
            &
          </div>
        )}
      </div>
    </section>
  );
}
