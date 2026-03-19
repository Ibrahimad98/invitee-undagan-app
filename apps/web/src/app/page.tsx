'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTemplatesPublic } from '@/hooks/queries/use-templates-public';
import { useTestimonialsPublic } from '@/hooks/queries/use-testimonials-public';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { HeroBackground } from '@/components/layout/hero-background';
import {
  Star,
  Sparkles,
  Palette,
  Share2,
  ArrowRight,
  CheckCircle,
  Clock,
  Gift,
  Users,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Footer } from '@/components/layout/footer';

/* ─── Hero rotating headlines ─── */
const HERO_HEADLINES = [
  { text: 'Undangan Digital yang', highlight: 'Elegan & Modern' },
  { text: 'Wujudkan Momen Spesial dengan', highlight: 'Undangan Impian' },
  { text: 'Buat Tamu Terkesan dengan', highlight: 'Desain Eksklusif' },
  { text: 'Undang Semua Orang dengan', highlight: 'Satu Klik Saja' },
  { text: 'Hemat Waktu & Biaya dengan', highlight: 'Undangan Premium' },
];

/* ─── Stats / social proof numbers ─── */
const STATS = [
  { value: '10,000+', label: 'Undangan Dibuat', icon: Heart },
  { value: '50,000+', label: 'Tamu Diundang', icon: Users },
  { value: '10+', label: 'Template Premium', icon: Palette },
  { value: '99%', label: 'Pelanggan Puas', icon: Star },
];

/* ─── How it works steps ─── */
const STEPS = [
  {
    step: '1',
    title: 'Pilih Template',
    desc: 'Pilih dari 10+ desain eksklusif yang cocok untuk acara Anda.',
    icon: Palette,
  },
  {
    step: '2',
    title: 'Isi Detail Acara',
    desc: 'Masukkan nama, tanggal, lokasi, dan informasi lainnya dengan mudah.',
    icon: Clock,
  },
  {
    step: '3',
    title: 'Bagikan ke Tamu',
    desc: 'Kirim undangan via WhatsApp, sosial media, atau link langsung.',
    icon: Share2,
  },
];

/* ─── FAQ items ─── */
const FAQ_ITEMS = [
  {
    q: 'Apakah Invitee gratis digunakan?',
    a: 'Ya! Anda bisa membuat undangan digital secara gratis. Kami juga menawarkan fitur premium untuk pengalaman yang lebih lengkap.',
  },
  {
    q: 'Berapa lama proses pembuatan undangan?',
    a: 'Hanya butuh 5-10 menit! Pilih template, isi data, dan undangan Anda siap dibagikan.',
  },
  {
    q: 'Bisakah saya meng-custom desain undangan?',
    a: 'Tentu! Setiap template bisa disesuaikan dengan nama, foto, warna, dan detail acara Anda.',
  },
  {
    q: 'Apakah undangan bisa dibagikan lewat WhatsApp?',
    a: 'Ya, undangan bisa langsung dibagikan via WhatsApp, Instagram, Telegram, atau link langsung ke tamu.',
  },
  {
    q: 'Apakah ada fitur RSVP dan ucapan?',
    a: 'Ada! Tamu bisa konfirmasi kehadiran (RSVP) dan mengirimkan ucapan & doa langsung dari undangan.',
  },
];

export default function Home() {
  const { data, isLoading } = useTemplatesPublic();
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonialsPublic();
  const templates = Array.isArray(data) ? data : [];

  /* ─── Hero headline rotation ─── */
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [headlineFade, setHeadlineFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineFade(false);
      setTimeout(() => {
        setHeadlineIdx((prev) => (prev + 1) % HERO_HEADLINES.length);
        setHeadlineFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Testimonial carousel ─── */
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialList = testimonials || [];
  const visibleTestimonials = testimonialList.length > 0 ? testimonialList : FALLBACK_TESTIMONIALS;

  const prevTestimonial = useCallback(() => {
    setTestimonialIdx((prev) => (prev === 0 ? visibleTestimonials.length - 1 : prev - 1));
  }, [visibleTestimonials.length]);
  const nextTestimonial = useCallback(() => {
    setTestimonialIdx((prev) => (prev + 1) % visibleTestimonials.length);
  }, [visibleTestimonials.length]);

  useEffect(() => {
    if (visibleTestimonials.length <= 1) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial, visibleTestimonials.length]);

  /* ─── FAQ accordion ─── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ═══════════ HERO SECTION — animated bg + rotating text ═══════════ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 text-center overflow-hidden min-h-[520px] flex items-center justify-center">
        <HeroBackground />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-primary-100/90 text-primary-700 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Undangan Digital #1 Indonesia
          </span>

          {/* Dynamic rotating headline */}
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight min-h-[4rem] sm:min-h-[5rem]">
            <span
              className="transition-all duration-500 ease-in-out inline-block"
              style={{
                opacity: headlineFade ? 1 : 0,
                transform: headlineFade ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              {HERO_HEADLINES[headlineIdx].text}{' '}
              <span className="text-primary-600">{HERO_HEADLINES[headlineIdx].highlight}</span>
            </span>
          </h1>

          <p className="text-gray-600 text-sm sm:text-lg max-w-xl mx-auto">
            Desain undangan pernikahan, khitanan, dan acara spesial lainnya dalam hitungan menit. Gratis & tanpa ribet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25 flex items-center justify-center gap-2"
            >
              Mulai Buat Undangan — Gratis!
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Lihat Template
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Gratis selamanya</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Siap dalam 5 menit</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Tanpa install</span>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF STATS ═══════════ */}
      <section className="py-10 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-1">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Kenapa Pilih Invitee?
            </h2>
            <p className="text-gray-500 text-sm mt-2">Semua yang Anda butuhkan dalam satu platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Palette,
                title: '10+ Template Eksklusif',
                desc: 'Desain unik untuk setiap acara — pernikahan, khitanan, ulang tahun, hingga Natal.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Share2,
                title: 'Kirim via WhatsApp & Sosmed',
                desc: 'Bagikan undangan langsung lewat WhatsApp, Instagram, atau link ke semua tamu.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: CheckCircle,
                title: 'RSVP & Konfirmasi Otomatis',
                desc: 'Tamu bisa konfirmasi kehadiran langsung dari undangan. Pantau di dashboard Anda.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Gift,
                title: 'Amplop Digital',
                desc: 'Terima hadiah & amplop digital langsung dari tamu. Praktis dan modern.',
                color: 'bg-yellow-50 text-yellow-600',
              },
              {
                icon: MessageCircle,
                title: 'Ucapan & Doa',
                desc: 'Tamu bisa mengirim ucapan dan doa langsung dari halaman undangan.',
                color: 'bg-pink-50 text-pink-600',
              },
              {
                icon: Clock,
                title: 'Countdown Timer',
                desc: 'Hitung mundur otomatis menuju hari H acara Anda. Bikin tamu semakin excited!',
                color: 'bg-orange-50 text-orange-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Cara Buat Undangan Digital
            </h2>
            <p className="text-gray-500 text-sm mt-2">Hanya 3 langkah mudah — selesai dalam hitungan menit</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.step} className="text-center relative">
                {/* Connector line (hidden on mobile, hidden after last) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-300 to-primary-100" />
                )}
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-600/25 relative z-10">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TEMPLATE SHOWCASE ═══════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Template Populer</h2>
            <p className="text-gray-500 text-sm mt-2">Pilih desain yang paling cocok untuk acara Anda</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {templates.slice(0, 10).map((template) => (
                <Link
                  key={template.id}
                  href={`/preview/${template.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
                >
                  <div className="h-44 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 mb-2">
                    <img
                      src={`/images/templates/${template.slug}.svg`}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{template.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {template.ratingAvg?.toFixed(1) || '0.0'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
            >
              Lihat Semua Template
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Apa Kata Mereka?
            </h2>
            <p className="text-gray-500 text-sm mt-2">Cerita dari pasangan yang sudah menggunakan Invitee</p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {loadingTestimonials ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-6" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto" />
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center relative">
                  {/* Quote icon */}
                  <div className="text-primary-200 text-6xl font-serif leading-none mb-4" aria-hidden="true">&ldquo;</div>

                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl mx-auto italic min-h-[3rem]">
                    {visibleTestimonials[testimonialIdx]?.message || ''}
                  </p>

                  {/* 3 Category Ratings */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4">
                    {[
                      { label: 'Desain', key: 'ratingDesain', icon: Palette, color: 'text-purple-500' },
                      { label: 'Kemudahan', key: 'ratingKemudahan', icon: Users, color: 'text-blue-500' },
                      { label: 'Layanan', key: 'ratingLayanan', icon: Heart, color: 'text-green-500' },
                    ].map((cat) => {
                      const val = (visibleTestimonials[testimonialIdx] as any)?.[cat.key] || 5;
                      return (
                        <div key={cat.key} className="flex items-center gap-1.5">
                          <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                          <span className="text-xs text-gray-500">{cat.label}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < val ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes if available */}
                  {(visibleTestimonials[testimonialIdx] as any)?.notes && (
                    <div className="max-w-md mx-auto mb-4 px-4 py-2 bg-gray-50 rounded-lg text-xs text-gray-500 italic">
                      📝 {(visibleTestimonials[testimonialIdx] as any).notes}
                    </div>
                  )}

                  <p className="font-semibold text-gray-900">
                    {visibleTestimonials[testimonialIdx]?.userName || ''}
                  </p>

                  {/* Dots indicator */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {visibleTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTestimonialIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === testimonialIdx
                            ? 'bg-primary-600 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Testimonial ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Nav arrows */}
                {visibleTestimonials.length > 1 && (
                  <>
                    <button
                      onClick={prevTestimonial}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-lg transition-all"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-lg transition-all"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <p className="text-gray-500 text-sm mt-2">Temukan jawaban untuk pertanyaan umum tentang Invitee</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-200 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900 pr-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: openFaq === i ? '200px' : '0px',
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="px-4 sm:px-5 pb-4 sm:pb-5 pl-12 sm:pl-14 text-sm text-gray-500 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-white" />
        </div>

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold">Siap Buat Undangan Digital?</h2>
          <p className="text-primary-100 text-sm sm:text-lg max-w-lg mx-auto">
            Bergabung bersama ribuan pasangan yang sudah membuat undangan impian mereka. Daftar gratis — tanpa kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-all hover:shadow-lg"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Lihat Demo Template
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Fallback testimonials when API returns empty ─── */
const FALLBACK_TESTIMONIALS = [
  {
    id: '1',
    userName: 'Rina & Andi',
    message: 'Invitee benar-benar membantu kami membuat undangan pernikahan yang cantik dalam waktu singkat. Tamu-tamu kami sangat terkesan dengan desainnya!',
    rating: 5,
    ratingDesain: 5,
    ratingKemudahan: 5,
    ratingLayanan: 5,
    notes: 'Sangat recommended untuk pasangan yang ingin undangan digital berkualitas.',
    createdAt: '',
  },
  {
    id: '2',
    userName: 'Dian & Fajar',
    message: 'Prosesnya sangat mudah dan cepat. Kami suka sekali template-nya yang elegan. Fitur RSVP dan ucapan juga sangat membantu.',
    rating: 5,
    ratingDesain: 5,
    ratingKemudahan: 5,
    ratingLayanan: 4,
    notes: 'Berharap ada lebih banyak pilihan font.',
    createdAt: '',
  },
  {
    id: '3',
    userName: 'Sarah & Budi',
    message: 'Awalnya ragu pakai undangan digital, tapi setelah coba Invitee, hasilnya luar biasa! Hemat biaya dan tamu bisa langsung konfirmasi kehadiran.',
    rating: 5,
    ratingDesain: 4,
    ratingKemudahan: 5,
    ratingLayanan: 5,
    createdAt: '',
  },
  {
    id: '4',
    userName: 'Mega & Rizki',
    message: 'Template wayang heritage-nya keren banget! Cocok dengan tema pernikahan Jawa kami. Terima kasih Invitee!',
    rating: 4,
    ratingDesain: 5,
    ratingKemudahan: 4,
    ratingLayanan: 4,
    notes: 'Template budaya lokal sangat diapresiasi!',
    createdAt: '',
  },
  {
    id: '5',
    userName: 'Fitri & Hasan',
    message: 'Sangat puas dengan fitur amplop digital dan galeri fotonya. Undangan kami terlihat sangat profesional dan modern.',
    rating: 5,
    ratingDesain: 5,
    ratingKemudahan: 4,
    ratingLayanan: 5,
    createdAt: '',
  },
];
