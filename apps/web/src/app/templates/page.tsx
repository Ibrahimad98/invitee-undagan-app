'use client';

import Link from 'next/link';
import { useTemplatesPublic } from '@/hooks/queries/use-templates-public';
import { Star, Users, Eye } from 'lucide-react';

export default function PublicTemplatesPage() {
  const { data, isLoading, error } = useTemplatesPublic();
  const templates = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Invitee" className="w-8 h-8" />
            <span className="font-bold text-lg text-orange-500">Invitee</span>
          </Link>
          <div className="flex items-center gap-3">
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Koleksi Template Undangan
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Pilih dari berbagai template undangan digital yang elegan dan profesional untuk acara spesial Anda.
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-5xl mb-4">⚠️</p>
            <h3 className="text-lg font-semibold text-gray-700">Gagal memuat template</h3>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-5xl mb-4">📭</p>
            <h3 className="text-lg font-semibold text-gray-700">Belum ada template</h3>
            <p className="text-sm text-gray-500 mt-1">Template akan segera tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden flex items-center justify-center">
                  {/* Typography fallback behind the image */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <div className="text-3xl mb-1">💌</div>
                    <p className="text-sm font-semibold text-gray-400 capitalize">{template.name}</p>
                    <p className="text-xs text-gray-300 mt-1">{template.category || 'Template'}</p>
                  </div>
                  <img
                    src={`/images/templates/${template.slug}.svg`}
                    alt={template.name}
                    className="w-full h-full object-cover relative z-[1]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {template.isPremium && (
                    <span className="absolute top-2 right-2 z-[2] bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Premium
                    </span>
                  )}
                  <div className="absolute inset-0 z-[2] bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/preview/${template.slug}`}
                      target="_blank"
                      className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {template.ratingAvg?.toFixed(1) || '0.0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {(template.usageCount || 0).toLocaleString()} digunakan
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/favicon.svg" alt="Invitee" className="w-6 h-6" />
          <span className="font-bold text-orange-500">Invitee</span>
        </div>
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Invitee. All rights reserved.</p>
      </footer>
    </div>
  );
}
