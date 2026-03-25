'use client';

import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionOrnament from './section-ornament';

interface HeroSectionProps {
  openingText?: string | null;
  title: string;
  eventType?: string;
}

/** Split title into prefix and names.
 *  "Pernikahan Budi & Ani" → { prefix: "Pernikahan", name1: "Budi", amp: "&", name2: "Ani", names: "Budi & Ani" }
 *  "Khitanan Muhammad Zidan" → { prefix: "Khitanan", name1: "Muhammad Zidan", amp: "", name2: "", names: "Muhammad Zidan" }
 */
function splitTitle(title: string) {
  const parts = title.split(' ');
  const ampIdx = parts.indexOf('&');
  // Has "&" — split around it (wedding/engagement/anniversary style)
  if (ampIdx >= 2) {
    return {
      prefix: parts.slice(0, ampIdx - 1).join(' '),
      name1: parts[ampIdx - 1],
      amp: '&',
      name2: parts.slice(ampIdx + 1).join(' '),
      names: parts.slice(ampIdx - 1).join(' '),
    };
  }
  // No "&" — first word is prefix, rest is the name
  if (parts.length >= 2) {
    return {
      prefix: parts[0],
      name1: parts.slice(1).join(' '),
      amp: '',
      name2: '',
      names: parts.slice(1).join(' '),
    };
  }
  return { prefix: '', name1: '', amp: '', name2: '', names: title };
}

// Detect active theme from DOM
const THEME_SLUGS = [
  'super-classic', 'floral-garden', 'kids-party', 'golden-elegance',
  'royal-muslim', 'wayang-heritage', 'slide-romantic', 'christmas-joy',
  'modern-minimal', 'simple-java', 'enchanted-garden', 'royal-blossom',
  'celestial-garden', 'ethereal-bloom',
];

export default function HeroSection({ openingText, title, eventType }: HeroSectionProps) {
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
    <section ref={sectionRef} className="invitation-section invitation-hero px-8 sm:px-12 py-14 sm:py-16 text-center bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]">
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
          </div>
        )}

        {/* ─── ENCHANTED GARDEN: Premium — framer-motion spring animations ─── */}
        {theme === 'enchanted-garden' && hasNames && (
          <AnimatePresence>
            <motion.div
              className="space-y-4 sm:space-y-5"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Vine arch ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={isVisible ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
              >
                <svg width="80" height="42" viewBox="0 0 100 50" className="text-[var(--inv-accent)]">
                  <path d="M5,48 C5,18 25,5 50,5 C75,5 95,18 95,48" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                  <ellipse cx="18" cy="28" rx="7" ry="3" transform="rotate(-30 18 28)" fill="currentColor" opacity="0.3" />
                  <ellipse cx="82" cy="28" rx="7" ry="3" transform="rotate(30 82 28)" fill="currentColor" opacity="0.3" />
                  <ellipse cx="35" cy="12" rx="6" ry="2.5" transform="rotate(-15 35 12)" fill="currentColor" opacity="0.25" />
                  <ellipse cx="65" cy="12" rx="6" ry="2.5" transform="rotate(15 65 12)" fill="currentColor" opacity="0.25" />
                  <ellipse cx="50" cy="6" rx="4" ry="2" fill="currentColor" opacity="0.35" />
                  <circle cx="25" cy="20" r="1.5" fill="currentColor" opacity="0.2" />
                  <circle cx="75" cy="20" r="1.5" fill="currentColor" opacity="0.2" />
                </svg>
              </motion.div>

              {/* Opening text */}
              {openingText && (
                <motion.p
                  className="text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {openingText}
                </motion.p>
              )}

              {/* Prefix */}
              <motion.p
                className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[var(--inv-text-secondary)]"
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={isVisible ? { opacity: 1, letterSpacing: '0.25em' } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {prefix}
              </motion.p>

              {/* Name 1 — spring entrance from left */}
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl leading-none"
                style={{ fontFamily: "'Great Vibes', cursive" }}
                initial={{ opacity: 0, x: -40, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.6 }}
              >
                {name1}
              </motion.h2>

              {/* Ampersand with expanding lines */}
              <motion.div
                className="flex items-center justify-center gap-3 my-3"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 150, damping: 10, delay: 0.75 }}
              >
                <motion.div
                  className="h-px bg-[var(--inv-accent)] opacity-30"
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 48 } : {}}
                  transition={{ duration: 0.8, delay: 0.85 }}
                />
                <span className="text-2xl sm:text-3xl" style={{ fontFamily: "'Great Vibes', cursive", color: 'var(--inv-accent)' }}>{amp}</span>
                <motion.div
                  className="h-px bg-[var(--inv-accent)] opacity-30"
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 48 } : {}}
                  transition={{ duration: 0.8, delay: 0.85 }}
                />
              </motion.div>

              {/* Name 2 — spring entrance from right */}
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl leading-none"
                style={{ fontFamily: "'Great Vibes', cursive" }}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.9 }}
              >
                {name2}
              </motion.h2>

              {/* Bottom wave ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <svg width="50" height="10" viewBox="0 0 60 8" className="text-[var(--inv-accent)] opacity-30">
                  <path d="M0,4 Q15,0 30,4 Q45,8 60,4" fill="none" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── ROYAL BLOSSOM: Premium — framer-motion spring + bokeh entrance ─── */}
        {theme === 'royal-blossom' && hasNames && (
          <AnimatePresence>
            <motion.div
              className="space-y-4 sm:space-y-5"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Ornate flower ornament — spinning entrance */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={isVisible ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.15 }}
              >
                <svg width="44" height="44" viewBox="0 0 48 48" className="text-[var(--inv-accent)]">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
                  <circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                  <ellipse cx="24" cy="15" rx="6" ry="3.5" fill="currentColor" opacity="0.2" />
                  <ellipse cx="16" cy="22" rx="6" ry="3.5" transform="rotate(72 16 22)" fill="currentColor" opacity="0.18" />
                  <ellipse cx="32" cy="22" rx="6" ry="3.5" transform="rotate(-72 32 22)" fill="currentColor" opacity="0.18" />
                  <ellipse cx="18" cy="32" rx="6" ry="3.5" transform="rotate(36 18 32)" fill="currentColor" opacity="0.15" />
                  <ellipse cx="30" cy="32" rx="6" ry="3.5" transform="rotate(-36 30 32)" fill="currentColor" opacity="0.15" />
                  <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
                  <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
                </svg>
              </motion.div>

              {/* Opening text — fade in */}
              {openingText && (
                <motion.p
                  className="text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line"
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.9, delay: 0.35 }}
                >
                  {openingText}
                </motion.p>
              )}

              {/* Prefix — tracking animation */}
              <motion.p
                className="text-[10px] sm:text-xs uppercase text-[var(--inv-text-secondary)]"
                initial={{ opacity: 0, letterSpacing: '0.8em' }}
                animate={isVisible ? { opacity: 1, letterSpacing: '0.4em' } : {}}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                {prefix}
              </motion.p>

              {/* Name 1 — slide from left with gold gradient */}
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif italic leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #d4a373, #e6c9a8, #d4a373)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0, x: -50, filter: 'blur(8px)' }}
                animate={isVisible ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.65 }}
              >
                {name1}
              </motion.h2>

              {/* Ampersand with expanding gold lines */}
              <motion.div
                className="flex items-center justify-center gap-3 my-2"
                initial={{ opacity: 0, scale: 0.2 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.8 }}
              >
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #d4a373, transparent)', opacity: 0.4 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 56 } : {}}
                  transition={{ duration: 0.7, delay: 0.9 }}
                />
                <span className="text-lg sm:text-xl font-serif italic text-[var(--inv-accent)] opacity-80">{amp}</span>
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #d4a373, transparent)', opacity: 0.4 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 56 } : {}}
                  transition={{ duration: 0.7, delay: 0.9 }}
                />
              </motion.div>

              {/* Name 2 — slide from right with gold gradient */}
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif italic leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #d4a373, #e6c9a8, #d4a373)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
                animate={isVisible ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.95 }}
              >
                {name2}
              </motion.h2>

              {/* Bottom diamond ornament */}
              <motion.div
                className="flex justify-center pt-2"
                initial={{ opacity: 0, scale: 0, rotate: 45 }}
                animate={isVisible ? { opacity: 0.4, scale: 1, rotate: 45 } : {}}
                transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 1.15 }}
              >
                <div className="w-2 h-2 bg-[var(--inv-accent)]" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── CELESTIAL GARDEN: Premium — framer-motion mystical forest entrance ─── */}
        {theme === 'celestial-garden' && hasNames && (
          <AnimatePresence>
            <motion.div
              className="space-y-4 sm:space-y-5"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Mystical firefly cluster ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0, filter: 'blur(12px)' }}
                animate={isVisible ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.1 }}
              >
                <svg width="60" height="36" viewBox="0 0 80 44" className="text-[var(--inv-accent)]">
                  <path d="M5,40 C5,16 20,5 40,5 C60,5 75,16 75,40" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                  <ellipse cx="16" cy="26" rx="6" ry="2" transform="rotate(-40 16 26)" fill="currentColor" opacity="0.2" />
                  <ellipse cx="64" cy="26" rx="6" ry="2" transform="rotate(40 64 26)" fill="currentColor" opacity="0.2" />
                  <circle cx="28" cy="14" r="2.5" fill="currentColor" opacity="0.4" />
                  <circle cx="52" cy="14" r="2" fill="currentColor" opacity="0.35" />
                  <circle cx="40" cy="8" r="3" fill="currentColor" opacity="0.5" />
                  <circle cx="20" cy="20" r="1.2" fill="currentColor" opacity="0.25" />
                  <circle cx="60" cy="20" r="1.2" fill="currentColor" opacity="0.25" />
                </svg>
              </motion.div>

              {/* Opening text */}
              {openingText && (
                <motion.p
                  className="text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line"
                  initial={{ opacity: 0, y: 15 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  {openingText}
                </motion.p>
              )}

              {/* Prefix */}
              <motion.p
                className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)]"
                initial={{ opacity: 0, letterSpacing: '0.6em' }}
                animate={isVisible ? { opacity: 1, letterSpacing: '0.3em' } : {}}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                {prefix}
              </motion.p>

              {/* Name 1 — emerge from darkness with teal glow */}
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl leading-none"
                style={{
                  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={isVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.65 }}
              >
                {name1}
              </motion.h2>

              {/* Ampersand with expanding teal lines */}
              <motion.div
                className="flex items-center justify-center gap-3 my-3"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 140, damping: 10, delay: 0.8 }}
              >
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #4ecdc4, transparent)', opacity: 0.4 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 52 } : {}}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
                <span
                  className="text-2xl sm:text-3xl"
                  style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: 'var(--inv-accent)', fontStyle: 'italic' }}
                >
                  {amp}
                </span>
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #4ecdc4, transparent)', opacity: 0.4 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 52 } : {}}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
              </motion.div>

              {/* Name 2 — emerge from darkness */}
              <motion.h2
                className="text-4xl sm:text-5xl md:text-6xl leading-none"
                style={{
                  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
                initial={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                animate={isVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.95 }}
              >
                {name2}
              </motion.h2>

              {/* Bottom wave ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.15 }}
              >
                <svg width="50" height="10" viewBox="0 0 60 8" className="text-[var(--inv-accent)] opacity-25">
                  <path d="M0,4 Q10,1 20,4 Q30,7 40,4 Q50,1 60,4" fill="none" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── ETHEREAL BLOOM: Premium — Three.js powered, luminous particle entrance ─── */}
        {theme === 'ethereal-bloom' && hasNames && (
          <AnimatePresence>
            <motion.div
              className="space-y-4 sm:space-y-5"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Luminous orb cluster ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0, filter: 'blur(14px)' }}
                animate={isVisible ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.1 }}
              >
                <svg width="56" height="32" viewBox="0 0 70 40" className="text-[var(--inv-accent)]">
                  <path d="M5,38 C5,16 18,5 35,5 C52,5 65,16 65,38" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
                  <circle cx="18" cy="22" r="4" fill="currentColor" opacity="0.2" />
                  <circle cx="35" cy="10" r="3.5" fill="currentColor" opacity="0.3" />
                  <circle cx="52" cy="22" r="4" fill="currentColor" opacity="0.2" />
                  <circle cx="26" cy="30" r="2" fill="#d4a0a0" opacity="0.2" />
                  <circle cx="44" cy="30" r="2" fill="#d4a0a0" opacity="0.2" />
                  <circle cx="35" cy="6" r="1.5" fill="#e8d5a3" opacity="0.35" />
                </svg>
              </motion.div>

              {/* Opening text — soft fade-in */}
              {openingText && (
                <motion.p
                  className="text-xs sm:text-sm leading-relaxed text-[var(--inv-text-secondary)] whitespace-pre-line"
                  initial={{ opacity: 0, y: 15 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  {openingText}
                </motion.p>
              )}

              {/* Prefix — expanding letter spacing */}
              <motion.p
                className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[var(--inv-text-secondary)]"
                initial={{ opacity: 0, letterSpacing: '0.7em' }}
                animate={isVisible ? { opacity: 1, letterSpacing: '0.3em' } : {}}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                {prefix}
              </motion.p>

              {/* Name 1 — emerge with lavender glow */}
              <motion.h2
                className="text-3xl sm:text-4xl leading-relaxed px-2"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontWeight: 400,
                  background: 'linear-gradient(135deg, #b8a9d4, #d4a0a0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                initial={{ opacity: 0, y: 35, filter: 'blur(12px)' }}
                animate={isVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.65 }}
              >
                {name1}
              </motion.h2>

              {/* Ampersand with expanding lavender-rose lines */}
              <motion.div
                className="flex items-center justify-center gap-3 my-3"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.8 }}
              >
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #b8a9d4, transparent)', opacity: 0.35 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 48 } : {}}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
                <span
                  className="text-2xl sm:text-3xl"
                  style={{ fontFamily: "'Great Vibes', cursive", color: '#d4a0a0' }}
                >
                  {amp}
                </span>
                <motion.div
                  className="h-px"
                  style={{ background: 'linear-gradient(to right, transparent, #d4a0a0, transparent)', opacity: 0.35 }}
                  initial={{ width: 0 }}
                  animate={isVisible ? { width: 48 } : {}}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
              </motion.div>

              {/* Name 2 — emerge from below */}
              <motion.h2
                className="text-3xl sm:text-4xl leading-relaxed px-2"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontWeight: 400,
                  background: 'linear-gradient(135deg, #d4a0a0, #e8d5a3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                initial={{ opacity: 0, y: -35, filter: 'blur(12px)' }}
                animate={isVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ type: 'spring', stiffness: 50, damping: 12, delay: 0.95 }}
              >
                {name2}
              </motion.h2>

              {/* Bottom wave ornament */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.15 }}
              >
                <svg width="48" height="10" viewBox="0 0 60 8" className="text-[var(--inv-accent)] opacity-20">
                  <path d="M0,4 Q15,1 30,4 Q45,7 60,4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </motion.div>
            </motion.div>
          </AnimatePresence>
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
