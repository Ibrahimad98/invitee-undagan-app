'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Invitee" className="w-8 h-8" />
              <span className="font-bold text-lg text-orange-500">Invitee</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Platform undangan digital Indonesia. Buat undangan pernikahan, khitanan, dan acara spesial lainnya dengan mudah.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">Navigasi</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/templates" className="hover:text-primary-600 transition-colors">
                  Template
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-600 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-600 transition-colors">
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary-600 transition-colors">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>support@invitee.id</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} Invitee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
