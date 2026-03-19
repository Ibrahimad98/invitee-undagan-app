'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  Instagram,
  MapPin,
  Clock,
  MessageCircle,
  Globe,
  Send,
  Heart,
} from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { HeroBackground } from '@/components/layout/hero-background';
import { useSettingsPublic, type SiteSetting } from '@/hooks/queries/use-settings';

/* Map item names (case-insensitive) to Lucide icons */
const ICON_MAP: Record<string, React.ElementType> = {
  whatsapp: Phone,
  telepon: Phone,
  phone: Phone,
  email: Mail,
  'e-mail': Mail,
  instagram: Instagram,
  alamat: MapPin,
  address: MapPin,
  lokasi: MapPin,
  'jam operasional': Clock,
  operasional: Clock,
  website: Globe,
  telegram: Send,
};

function getIcon(item: string) {
  const key = item.toLowerCase();
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return Icon;
  }
  return MessageCircle;
}

/* Build an href for clickable items */
function getHref(item: string, value: string): string | null {
  const lower = item.toLowerCase();
  if (lower.includes('whatsapp'))
    return `https://wa.me/${value.replace(/\D/g, '')}`;
  if (lower.includes('email') || lower.includes('e-mail'))
    return `mailto:${value}`;
  if (lower.includes('instagram'))
    return `https://instagram.com/${value.replace('@', '')}`;
  if (lower.includes('website') || lower.includes('web'))
    return value.startsWith('http') ? value : `https://${value}`;
  if (lower.includes('telegram'))
    return `https://t.me/${value.replace('@', '')}`;
  return null;
}

function ContactCard({ setting }: { setting: SiteSetting }) {
  const Icon = getIcon(setting.item);
  const href = getHref(setting.item, setting.value);
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{setting.item}</h3>
          <p className="text-primary-600 font-medium mt-0.5 break-all">{setting.value}</p>
          {setting.description && (
            <p className="text-xs text-gray-400 mt-1">{setting.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export default function ContactPage() {
  const { data: contacts, isLoading } = useSettingsPublic('contact');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 px-4 text-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-6">
            <MessageCircle className="w-3.5 h-3.5" /> Hubungi Kami
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Ada Pertanyaan? <span className="text-primary-600">Kami Siap Membantu</span>
          </h1>
          <p className="mt-6 text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Jangan ragu untuk menghubungi kami melalui channel di bawah ini.
            Tim kami akan dengan senang hati membantu Anda.
          </p>
        </div>
      </section>

      {/* Contact items */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse h-24" />
              ))}
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {contacts.map((c) => (
                <ContactCard key={c.id} setting={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Informasi kontak belum tersedia.</p>
            </div>
          )}
        </div>
      </section>

      {/* Map / additional info */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Kami Berlokasi di Jakarta
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Invitee beroperasi dari Jakarta, Indonesia. Melayani seluruh Indonesia secara online.
          </p>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              title="Invitee Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253840.65295222686!2d106.68943025!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta!5e0!3m2!1sen!2sid!4v1710000000000"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Siap Membuat Undangan?</h2>
          <p className="text-primary-100 mb-8">
            Mulai buat undangan digital Anda sekarang — gratis!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            <Heart className="w-4 h-4" /> Mulai Gratis Sekarang
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
