'use client';

import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Footer } from '@/components/layout/footer';
import { Check, X, Crown, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Basic',
    tagline: 'Mulai buat undangan digital gratis',
    price: 'Gratis',
    priceNote: 'Selamanya',
    icon: Star,
    color: 'blue',
    features: [
      { text: 'Template dasar gratis', included: true },
      { text: 'Maks 1 undangan (beta)', included: true, beta: true },
      { text: 'Maks 300 tamu per undangan', included: true },
      { text: 'Import tamu CSV', included: true },
      { text: 'RSVP & ucapan tamu', included: true },
      { text: 'Template premium', included: false },
      { text: 'Export Excel', included: false },
      { text: 'Download PDF per tamu', included: false },
    ],
    cta: 'Daftar Gratis',
    ctaHref: '/register',
  },
  {
    name: 'Premium',
    tagline: 'Fitur lengkap untuk acara sempurna',
    price: 'Segera Diumumkan',
    priceNote: 'Hubungi kami untuk info lebih lanjut',
    icon: Crown,
    color: 'amber',
    popular: true,
    features: [
      { text: 'Semua template termasuk premium', included: true },
      { text: 'Hingga 3 undangan (beta)', included: true, beta: true },
      { text: 'Kuota hingga 2000 tamu', included: true },
      { text: 'Import Excel & CSV', included: true },
      { text: 'Export data ke Excel', included: true },
      { text: 'Download PDF per tamu', included: true },
      { text: 'Unlimited galeri foto', included: true },
      { text: 'Prioritas dukungan', included: true },
    ],
    cta: 'Daftar & Request Premium',
    ctaHref: '/register',
  },
  {
    name: 'Enterprise',
    tagline: 'Kami yang buatkan undangan Anda',
    price: 'Layanan Khusus',
    priceNote: 'Hubungi admin untuk detail',
    icon: Zap,
    color: 'emerald',
    features: [
      { text: 'Semua fitur Premium', included: true },
      { text: 'Kuota undangan custom (beta)', included: true, beta: true },
      { text: 'Undangan dibuatkan admin', included: true },
      { text: 'Setup cepat & instan', included: true },
      { text: 'Konsultasi desain', included: true },
      { text: 'Kuota tamu disesuaikan', included: true },
      { text: 'Prioritas dukungan VIP', included: true },
      { text: 'Semua template premium', included: true },
    ],
    cta: 'Hubungi Kami',
    ctaHref: '/contact',
  },
];

export default function PricingPage() {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Harga & Paket
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Pilih Paket <span className="text-primary-600">Terbaik</span> untuk Anda
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Mulai buat undangan digital gratis atau upgrade untuk fitur yang lebih lengkap.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const colorMap: Record<string, { bg: string; text: string; btn: string; ring: string }> = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white', ring: '' },
                amber: { bg: 'bg-amber-50', text: 'text-amber-600', btn: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white', ring: 'ring-2 ring-amber-200 shadow-xl' },
                emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', ring: '' },
              };
              const colors = colorMap[plan.color] || colorMap.blue;

              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative bg-white rounded-2xl border border-gray-200 p-8 flex flex-col transition-all hover:shadow-lg',
                    colors.ring,
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      ⭐ Paling Populer
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="space-y-4 mb-6">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
                      <Icon className={cn('w-6 h-6', colors.text)} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.tagline}</p>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <p className="text-xs text-gray-400 mt-1">{plan.priceNote}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-start gap-2.5">
                        {f.included ? (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span className={cn('text-sm', f.included ? 'text-gray-700' : 'text-gray-400')}>
                          {f.text}
                          {(f as any).beta && (
                            <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              BETA
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      'block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all',
                      colors.btn,
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Beta Notice */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <Shield className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Saat Ini dalam Tahap Beta</h3>
            <p className="text-gray-600 max-w-xl mx-auto mb-4">
              Invitee sedang dalam tahap pengembangan. Selama masa beta, jumlah undangan dibatasi untuk menjaga kualitas:
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <div className="bg-white rounded-xl px-4 py-3 border border-blue-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-xs text-gray-500">undangan Basic</div>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 border border-amber-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-amber-600">3</div>
                <div className="text-xs text-gray-500">undangan Premium</div>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 border border-emerald-200 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-emerald-600">Custom</div>
                <div className="text-xs text-gray-500">Enterprise</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Setelah masa beta berakhir, semua batasan akan disesuaikan sesuai paket.
              Harga paket Premium akan diumumkan saat launching resmi.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
