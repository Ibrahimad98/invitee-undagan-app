'use client';

import Link from 'next/link';
import { Crown, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PlanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Profil
      </Link>

      {/* Coming Soon Hero */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400 p-8 sm:p-12 text-center text-white relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Halaman Paket & Langganan</h1>
            <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
              Kami sedang menyiapkan pengalaman terbaik untuk fitur langganan. Nantikan!
            </p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900">Fitur yang akan hadir:</h2>
            <div className="grid gap-2 text-left">
              {[
                'Pilihan paket Basic & Premium',
                'Pembayaran online yang mudah',
                'Upgrade & downgrade kapan saja',
                'Riwayat transaksi & invoice',
                'Diskon untuk perpanjangan paket',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard/profile'}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Profil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
