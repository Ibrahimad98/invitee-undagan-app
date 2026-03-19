'use client';

import Link from 'next/link';
import { Heart, Users, Sparkles, Shield } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { HeroBackground } from '@/components/layout/hero-background';

const VALUES = [
  {
    icon: Heart,
    title: 'Penuh Cinta',
    desc: 'Setiap undangan kami rancang dengan sentuhan personal agar momen spesial Anda terasa lebih istimewa.',
  },
  {
    icon: Sparkles,
    title: 'Desain Premium',
    desc: 'Koleksi template eksklusif yang dirancang oleh desainer profesional dengan perhatian pada detail.',
  },
  {
    icon: Users,
    title: 'Mudah Digunakan',
    desc: 'Antarmuka yang intuitif sehingga siapa pun bisa membuat undangan digital dalam hitungan menit.',
  },
  {
    icon: Shield,
    title: 'Terpercaya',
    desc: 'Ribuan pasangan telah mempercayakan momen berharga mereka kepada Invitee.',
  },
];

const TEAM = [
  { name: 'Ibrahim Adam', role: 'Founder & Developer', avatar: '👨‍💻' },
  { name: 'Tim Desain', role: 'UI / UX & Template', avatar: '🎨' },
  { name: 'Tim Support', role: 'Customer Service', avatar: '💬' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 px-4 text-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-6">
            <Heart className="w-3.5 h-3.5" /> Tentang Kami
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Mewujudkan Undangan Digital yang{' '}
            <span className="text-primary-600">Berkesan</span>
          </h1>
          <p className="mt-6 text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Invitee adalah platform undangan digital Indonesia yang membantu Anda membuat undangan pernikahan,
            khitanan, dan acara spesial lainnya dengan mudah, cepat, dan elegan.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Cerita Kami
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Invitee lahir dari keinginan sederhana — membantu pasangan Indonesia membagikan kebahagiaan mereka
                secara digital dengan cara yang elegan dan terjangkau.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Kami percaya bahwa setiap momen spesial layak dirayakan dengan indah. Itulah mengapa kami
                menghadirkan koleksi template premium yang bisa disesuaikan sepenuhnya dengan keinginan Anda.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dari undangan pernikahan hingga khitanan, Invitee hadir sebagai solusi digital yang modern,
                praktis, dan ramah lingkungan.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💍</div>
                  <p className="text-primary-700 font-semibold text-lg">Sejak 2024</p>
                  <p className="text-primary-600 text-sm mt-1">Melayani Ribuan Pasangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nilai-Nilai Kami</h2>
            <p className="mt-3 text-gray-600">Yang menjadi dasar setiap keputusan dan inovasi kami.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Tim Kami</h2>
            <p className="mt-3 text-gray-600">Orang-orang di balik Invitee.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TEAM.map((t) => (
              <div
                key={t.name}
                className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <div className="text-5xl mb-4">{t.avatar}</div>
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Siap Membuat Undangan Impian?</h2>
          <p className="text-primary-100 mb-8">
            Bergabung dengan ribuan pasangan yang sudah menggunakan Invitee.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Mulai Gratis Sekarang
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
