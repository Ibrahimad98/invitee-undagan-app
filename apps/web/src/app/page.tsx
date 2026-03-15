'use client';

import Link from 'next/link';
import { useTemplatesPublic } from '@/hooks/queries/use-templates-public';
import { Star, Sparkles, Palette, Share2, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  const { data, isLoading } = useTemplatesPublic();
  const templates = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Invitee" className="w-8 h-8" />
            <span className="font-bold text-lg text-gray-900">Invitee</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Template
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 text-center bg-gradient-to-b from-primary-50/50 to-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Undangan Digital #1 Indonesia
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Buat Undangan Digital yang <span className="text-primary-600">Elegan & Modern</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-lg max-w-xl mx-auto">
            Desain undangan pernikahan, khitanan, dan acara spesial lainnya dalam hitungan menit.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Lihat Template
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Kenapa Pilih Invitee?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: '10+ Template Unik',
                desc: 'Desain eksklusif yang cantik untuk setiap jenis acara, dari pernikahan hingga pesta anak.',
              },
              {
                icon: Share2,
                title: 'Mudah Dibagikan',
                desc: 'Bagikan undangan lewat WhatsApp, Instagram, atau link langsung ke tamu undangan.',
              },
              {
                icon: Sparkles,
                title: 'Fitur Lengkap',
                desc: 'RSVP, countdown, galeri foto, amplop digital, ucapan & doa, dan banyak lagi.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center space-y-3 p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section className="py-16 px-4 bg-gray-50">
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
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
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

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-600 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Siap Buat Undangan Digital?</h2>
          <p className="text-primary-100 text-sm sm:text-base">
            Daftar gratis dan mulai buat undangan digital pertama Anda sekarang juga.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors"
          >
            Daftar Gratis Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
