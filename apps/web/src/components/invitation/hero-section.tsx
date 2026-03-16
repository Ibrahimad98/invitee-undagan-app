'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import { useCallback, useEffect, useRef, useState } from 'react';
import SectionOrnament from './section-ornament';

interface HeroSectionProps {
  openingText?: string | null;
  title: string;
}

/** Split "Pernikahan Budi & Ani" → { prefix: "Pernikahan", names: "Budi & Ani" } */
function splitTitle(title: string) {
  const parts = title.split(' ');
  const ampIdx = parts.indexOf('&');
  if (ampIdx >= 2) {
    return {
      prefix: parts.slice(0, ampIdx - 1).join(' '),
      name1: parts[ampIdx - 1],
      amp: '&',
      name2: parts.slice(ampIdx + 1).join(' '),
      names: parts.slice(ampIdx - 1).join(' '),
    };
  }
  return { prefix: '', name1: '', amp: '', name2: '', names: title };
}

// Detect active theme from DOM
const THEME_SLUGS = [
  'super-classic', 'floral-garden', 'kids-party', 'golden-elegance',
  'royal-muslim', 'wayang-heritage', 'slide-romantic', 'christmas-joy',
  'modern-minimal', 'simple-java',
];

export default function HeroSection({ openingText, title }: HeroSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [theme, setTheme] = useState('');
  const sectionElRef = useRef<HTMLElement | null>(null);

  // Detect theme on mount
  useEffect(() => {
    const el = sectionElRef.current;
    if (!el) return;
    const root = el.closest('.invitation-root');
    if (!root) return;
    for (const slug of THEME_SLUGS) {
      if (root.classList.contains(`theme-${slug}`)) {
        setTheme(slug);
        return;
      }
    }
  }, []);

  // Merge scroll-animation ref + local ref
  const sectionRef = useCallback(
    (el: HTMLElement | null) => {
      sectionElRef.current = el;
      (ref as React.MutableRefObject<HTMLElement | null>).current = el;
    },
    [ref]
  );

  const { prefix, name1, amp, name2, names } = splitTitle(title);
  const hasNames = !!prefix;

  return (
    <section ref={sectionRef} className="invitation-section invitation-hero px-4 sm:px-8 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
      <SectionOrnament position="frame" />

      <div className={`max-w-lg mx-auto w-full ${animClass(isVisible, 'fade-up')}`}>

        {/* ─── SUPER CLASSIC: Stacked serif with gold line dividers ─── */}
        {theme === 'super-classic' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
                <path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[var(--inv-text-secondary)] mb-3">{prefix}</p>
              <div className="w-16 h-px mx-auto bg-[var(--inv-accent)] opacity-40 mb-4" />
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-none tracking-wide">{name1}</h2>
              <p className="text-xl sm:text-2xl font-serif text-[var(--inv-accent)] my-2 italic">{amp}</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-none tracking-wide">{name2}</h2>
              <div className="w-16 h-px mx-auto bg-[var(--inv-accent)] opacity-40 mt-4" />
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── FLORAL GARDEN: Elegant italic with petal-pink ampersand ─── */}
        {theme === 'floral-garden' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
                <circle cx="16" cy="4" r="3" fill="currentColor" opacity="0.7" />
                <circle cx="8" cy="12" r="3" fill="currentColor" opacity="0.5" />
                <circle cx="24" cy="12" r="3" fill="currentColor" opacity="0.5" />
                <circle cx="16" cy="12" r="2" fill="currentColor" opacity="0.8" />
                <circle cx="11" cy="20" r="2.5" fill="currentColor" opacity="0.4" />
                <circle cx="21" cy="20" r="2.5" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[var(--inv-text-secondary)] mb-4">{prefix}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic leading-tight">{name1}</h2>
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="w-10 sm:w-14 h-px bg-[var(--inv-accent)] opacity-30" />
                <span className="text-3xl sm:text-4xl font-serif text-[var(--inv-accent)]">&amp;</span>
                <div className="w-10 sm:w-14 h-px bg-[var(--inv-accent)] opacity-30" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic leading-tight">{name2}</h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── KIDS PARTY: Bouncy colorful text with rainbow ampersand ─── */}
        {theme === 'kids-party' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center gap-1 ${animClass(isVisible, 'zoom-in', 100)}`}>
              {['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'].map((c, i) => (
                <svg key={i} width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={c} /></svg>
              ))}
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-sm sm:text-base font-bold tracking-widest uppercase text-[var(--inv-accent)] mb-3">🎉 {prefix} 🎉</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none" style={{ fontFamily: 'inherit' }}>
                <span className="inline-block" style={{ color: '#ff6b6b' }}>{name1}</span>
              </h2>
              <p className="text-2xl sm:text-3xl font-bold my-1" style={{
                background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{amp}</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-none" style={{ fontFamily: 'inherit' }}>
                <span className="inline-block" style={{ color: '#48dbfb' }}>{name2}</span>
              </h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── GOLDEN ELEGANCE: Cinzel all-caps with gold gradient, deco lines ─── */}
        {theme === 'golden-elegance' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" className="text-[var(--inv-accent)]">
                <polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-[10px] sm:text-xs tracking-[0.5em] uppercase text-[var(--inv-text-secondary)] mb-4">{prefix}</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex-1 max-w-[60px] h-px bg-gradient-to-r from-transparent to-[var(--inv-accent)] opacity-50" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[var(--inv-accent)] opacity-60" />
                <div className="flex-1 max-w-[60px] h-px bg-gradient-to-l from-transparent to-[var(--inv-accent)] opacity-50" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif uppercase tracking-[0.12em] leading-tight" style={{
                background: 'linear-gradient(135deg, #d4a843, #f5d880, #d4a843)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{name1}</h2>
              <p className="text-lg sm:text-xl font-serif text-[var(--inv-accent)] my-1 opacity-70">{amp}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif uppercase tracking-[0.12em] leading-tight" style={{
                background: 'linear-gradient(135deg, #d4a843, #f5d880, #d4a843)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>{name2}</h2>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex-1 max-w-[60px] h-px bg-gradient-to-r from-transparent to-[var(--inv-accent)] opacity-50" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[var(--inv-accent)] opacity-60" />
                <div className="flex-1 max-w-[60px] h-px bg-gradient-to-l from-transparent to-[var(--inv-accent)] opacity-50" />
              </div>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── ROYAL MUSLIM: Arabic-style with Bismillah, crescent, ornate ─── */}
        {theme === 'royal-muslim' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="36" height="36" viewBox="0 0 40 40" className="text-[var(--inv-accent)]">
                <path d="M20,5 Q30,5 30,15 Q30,25 20,30 Q10,25 10,15 Q10,5 20,5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M15,12 Q20,8 25,12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                <circle cx="20" cy="18" r="2" fill="currentColor" opacity="0.5" />
                <path d="M17,24 L20,22 L23,24" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)] mb-4">{prefix}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight" style={{ color: '#c9a84c' }}>{name1}</h2>
              <div className="flex items-center justify-center gap-2 my-2">
                <div className="w-8 h-px bg-[var(--inv-accent)] opacity-30" />
                <span className="text-lg sm:text-xl font-serif text-[var(--inv-accent)] opacity-80">{amp}</span>
                <div className="w-8 h-px bg-[var(--inv-accent)] opacity-30" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight" style={{ color: '#c9a84c' }}>{name2}</h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── WAYANG HERITAGE: Traditional with batik-style ornament ─── */}
        {theme === 'wayang-heritage' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="48" height="20" viewBox="0 0 60 20" className="text-[var(--inv-accent)]">
                <path d="M10,2 L20,10 L10,18 L0,10Z" fill="currentColor" opacity="0.5" />
                <path d="M30,4 L38,10 L30,16 L22,10Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M50,2 L60,10 L50,18 L40,10Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)] mb-3">{prefix}</p>
              <div className="border-t border-b border-[var(--inv-accent)] border-opacity-20 py-4 sm:py-5 mx-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">{name1}</h2>
                <p className="text-base sm:text-lg font-serif text-[var(--inv-accent)] my-1">{amp}</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">{name2}</h2>
              </div>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── SLIDE ROMANTIC: Flowing script with heart ─── */}
        {theme === 'slide-romantic' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="28" height="26" viewBox="0 0 24 22" className="text-[var(--inv-accent)]">
                <path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.2em] text-[var(--inv-text-secondary)] mb-3 italic">{prefix}</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl leading-none" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>{name1}</h2>
              <p className="text-2xl sm:text-3xl text-[var(--inv-accent)] my-1" style={{ fontFamily: "'Dancing Script', cursive" }}>{amp}</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl leading-none" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>{name2}</h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── CHRISTMAS JOY: Festive serif with red/green accents ─── */}
        {theme === 'christmas-joy' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" className="text-[var(--inv-accent)]">
                <path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="currentColor" opacity="0.7" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)] mb-3">{prefix}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight" style={{ color: '#c0392b' }}>{name1}</h2>
              <div className="flex items-center justify-center gap-3 my-2">
                <div className="w-6 h-px" style={{ background: '#c0392b', opacity: 0.4 }} />
                <span className="text-lg font-serif" style={{ color: '#27ae60' }}>{amp}</span>
                <div className="w-6 h-px" style={{ background: '#27ae60', opacity: 0.4 }} />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight" style={{ color: '#27ae60' }}>{name2}</h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── MODERN MINIMAL: Clean sans-serif uppercase with thin lines ─── */}
        {theme === 'modern-minimal' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-[10px] sm:text-xs tracking-[0.5em] uppercase text-[var(--inv-text-secondary)] mb-6">{prefix}</p>
              <div className="w-full max-w-[200px] mx-auto h-px bg-[var(--inv-text-primary)] opacity-10 mb-6" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.15em] leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{name1}</h2>
              <p className="text-base tracking-[0.3em] text-[var(--inv-text-secondary)] my-3" style={{ fontWeight: 200 }}>{amp}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.15em] leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{name2}</h2>
              <div className="w-full max-w-[200px] mx-auto h-px bg-[var(--inv-text-primary)] opacity-10 mt-6" />
            </div>
          </div>
        )}

        {/* ─── SIMPLE JAVA: Warm serif with batik diamond ornament ─── */}
        {theme === 'simple-java' && hasNames && (
          <div className="space-y-4 sm:space-y-5">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="52" height="20" viewBox="0 0 60 20" className="text-[var(--inv-accent)]">
                <path d="M10,2 L20,10 L10,18 L0,10Z" fill="currentColor" opacity="0.6" />
                <path d="M30,4 L38,10 L30,16 L22,10Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M50,2 L60,10 L50,18 L40,10Z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <div className={animClass(isVisible, 'fade-up', 300)}>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)] mb-3">{prefix}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">{name1}</h2>
              <div className="flex items-center justify-center gap-2 my-2">
                <svg width="16" height="16" viewBox="0 0 20 20" className="text-[var(--inv-accent)] opacity-40"><path d="M10,2 L18,10 L10,18 L2,10Z" fill="currentColor" /></svg>
                <span className="text-lg font-serif text-[var(--inv-accent)]">{amp}</span>
                <svg width="16" height="16" viewBox="0 0 20 20" className="text-[var(--inv-accent)] opacity-40"><path d="M10,2 L18,10 L10,18 L2,10Z" fill="currentColor" /></svg>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">{name2}</h2>
            </div>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}

        {/* ─── FALLBACK: Any unmatched theme or title without & ─── */}
        {(!theme || !hasNames) && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`flex justify-center ${animClass(isVisible, 'zoom-in', 100)}`}>
              <svg width="28" height="28" viewBox="0 0 32 32" className="text-[var(--inv-accent)]">
                <path d="M16 4c2 6 6 10 12 12-6 2-10 6-12 12-2-6-6-10-12-12 6-2 10-6 12-12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              </svg>
            </div>
            {openingText && <p className={`text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line ${animClass(isVisible, 'fade', 200)}`}>{openingText}</p>}
            <h2 className={`text-2xl sm:text-3xl md:text-5xl font-serif leading-tight text-center ${animClass(isVisible, 'fade-up', 300)}`}>
              {hasNames ? (
                <>
                  <span className="block">{prefix}</span>
                  <span className="block">{names}</span>
                </>
              ) : title}
            </h2>
            <SectionOrnament position="divider" className={animClass(isVisible, 'fade', 400)} />
          </div>
        )}
      </div>

      {/* Scroll down hint */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${animClass(isVisible, 'fade', 800)}`}>
        <div className="animate-bounce-slow text-[var(--inv-text-secondary)] opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
