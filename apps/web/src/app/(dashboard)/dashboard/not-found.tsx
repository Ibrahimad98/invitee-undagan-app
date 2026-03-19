'use client';

import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      {/* 404 Illustration */}
      <div className="relative">
        <div className="text-[120px] sm:text-[160px] font-extrabold text-gray-100 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 text-sm">
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan. 
          Silakan kembali ke dashboard atau halaman sebelumnya.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <Link href="/dashboard">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            Ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
