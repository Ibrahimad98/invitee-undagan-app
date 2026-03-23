'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionBadge } from '@/components/ui/subscription-badge';
import { api } from '@/lib/api';
import {
  Crown, Check, X, Sparkles, ArrowLeft, Zap, Star, Shield,
  Mail, Users, Palette, FileSpreadsheet, FileDown, Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const PLANS = [
  {
    id: 'BASIC',
    name: 'Basic',
    tagline: 'Untuk kebutuhan dasar',
    price: 'Gratis',
    priceNote: 'Selamanya',
    icon: Star,
    color: 'blue',
    features: [
      { text: 'Template dasar gratis', included: true },
      { text: 'Maks 1 undangan (beta)', included: true, beta: true },
      { text: 'Maks 300 tamu per undangan', included: true },
      { text: 'Import tamu CSV', included: true },
      { text: 'RSVP & ucapan', included: true },
      { text: 'Template premium', included: false },
      { text: 'Export Excel', included: false },
      { text: 'Download PDF per tamu', included: false },
      { text: 'Unlimited galeri foto', included: false },
      { text: 'Prioritas dukungan', included: false },
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    tagline: 'Fitur lengkap tanpa batas',
    price: 'Segera Hadir',
    priceNote: 'Harga akan diumumkan',
    icon: Crown,
    color: 'amber',
    popular: true,
    features: [
      { text: 'Semua template termasuk premium', included: true },
      { text: 'Hingga 3 undangan (beta)', included: true, beta: true },
      { text: 'Kuota hingga 2000 tamu', included: true },
      { text: 'Import tamu Excel & CSV', included: true },
      { text: 'RSVP & ucapan', included: true },
      { text: 'Template premium', included: true },
      { text: 'Export Excel', included: true },
      { text: 'Download PDF per tamu', included: true },
      { text: 'Unlimited galeri foto', included: true },
      { text: 'Prioritas dukungan', included: true },
    ],
  },
  {
    id: 'FAST_SERVE',
    name: 'Enterprise',
    tagline: 'Dibuat oleh admin',
    price: 'Layanan Khusus',
    priceNote: 'Hubungi admin',
    icon: Zap,
    color: 'emerald',
    features: [
      { text: 'Semua fitur Premium', included: true },
      { text: 'Kuota undangan custom (beta)', included: true, beta: true },
      { text: 'Undangan dibuatkan admin', included: true },
      { text: 'Setup cepat & instan', included: true },
      { text: 'Konsultasi desain', included: true },
      { text: 'Kuota tamu disesuaikan', included: true },
      { text: 'Template premium', included: true },
      { text: 'Export Excel', included: true },
      { text: 'Download PDF per tamu', included: true },
      { text: 'Unlimited galeri foto', included: true },
      { text: 'Prioritas dukungan VIP', included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'PREMIUM' | 'ENTERPRISE'>('PREMIUM');
  const [requestReason, setRequestReason] = useState('');

  const currentPlan = user?.subscriptionType || 'BASIC';
  const isPremium = currentPlan === 'PREMIUM' || currentPlan === 'FAST_SERVE' || user?.role === 'ADMIN';

  const handleSubmitRequest = async () => {
    if (!requestReason.trim()) {
      addToast('Alasan wajib diisi', 'error');
      return;
    }
    setRequestLoading(true);
    try {
      await api.post('/users/guest-limit-requests', {
        requestedAmount: requestType === 'PREMIUM' ? 2000 : 5000,
        reason: `[Request ${requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'}] ${requestReason}`,
      });
      addToast(`Permintaan akses ${requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'} telah dikirim ke admin!`, 'success');
      setShowRequestModal(false);
      setRequestReason('');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('sedang diproses')) {
        addToast('Anda sudah memiliki permintaan yang sedang diproses. Silakan tunggu persetujuan admin.', 'info');
      } else {
        addToast(error.response?.data?.message || 'Gagal mengirim permintaan', 'error');
      }
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className="absolute left-4 sm:left-8 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Paket Langganan
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Pilih Paket yang Tepat untuk Anda</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Buat undangan digital yang mengesankan dengan fitur-fitur terbaik kami.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-sm text-gray-500">Paket Anda saat ini:</span>
          <SubscriptionBadge type={currentPlan} />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const colorMap: Record<string, { ring: string; bg: string; text: string; badge: string; btn: string }> = {
            blue: { ring: 'ring-blue-200', bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' },
            amber: { ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', btn: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' },
            emerald: { ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700' },
          };
          const colors = colorMap[plan.color] || colorMap.blue;

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden transition-all',
                isCurrentPlan && `ring-2 ${colors.ring}`,
                plan.popular && 'shadow-lg',
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  Populer
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                {/* Plan header */}
                <div className="space-y-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
                    <Icon className={cn('w-6 h-6', colors.text)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.tagline}</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.priceNote}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2.5 pt-4 border-t">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                      )}
                      <span className={cn('text-sm', feature.included ? 'text-gray-700' : 'text-gray-400')}>
                        {feature.text}
                        {(feature as any).beta && (
                          <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            BETA
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="pt-2">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full" variant="outline">
                      Paket Anda Saat Ini
                    </Button>
                  ) : plan.id === 'BASIC' ? (
                    <Button disabled variant="outline" className="w-full">
                      Paket Gratis
                    </Button>
                  ) : plan.id === 'FAST_SERVE' ? (
                    <Button
                      className={cn('w-full text-white', colors.btn)}
                      onClick={() => { setRequestType('ENTERPRISE'); setRequestReason(''); setShowRequestModal(true); }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Request Akses Enterprise
                    </Button>
                  ) : (
                    <Button
                      className={cn('w-full text-white', colors.btn)}
                      onClick={() => { setRequestType('PREMIUM'); setRequestReason(''); setShowRequestModal(true); }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Request Akses Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Beta Notice */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
        <CardContent className="p-5 text-center">
          <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">🚀 Status Beta</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-lg mx-auto mb-3">
            Invitee sedang dalam tahap beta. Selama masa ini, jumlah undangan dibatasi:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-3">
            <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 text-center">
              <div className="text-lg font-bold text-blue-600">1</div>
              <div className="text-[10px] text-gray-500">Basic</div>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-amber-200 text-center">
              <div className="text-lg font-bold text-amber-600">3</div>
              <div className="text-[10px] text-gray-500">Premium</div>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200 text-center">
              <div className="text-lg font-bold text-emerald-600">Custom</div>
              <div className="text-[10px] text-gray-500">Enterprise</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Kuota tamu: Basic 300, Premium 2000, Enterprise disesuaikan.
            Batasan akan dihapus setelah launching resmi.
          </p>
        </CardContent>
      </Card>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className={cn(
                'mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3',
                requestType === 'PREMIUM'
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500',
              )}>
                {requestType === 'PREMIUM' ? (
                  <Crown className="w-7 h-7 text-white" />
                ) : (
                  <Zap className="w-7 h-7 text-white" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Request Akses {requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {requestType === 'PREMIUM'
                  ? 'Dapatkan akses ke semua template premium, export Excel, dan fitur lainnya.'
                  : 'Layanan eksklusif — undangan akan dibuatkan oleh tim kami.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  placeholder={
                    requestType === 'PREMIUM'
                      ? 'Contoh: Saya membutuhkan fitur export Excel dan template premium untuk acara pernikahan saya...'
                      : 'Contoh: Saya ingin tim Invitee yang membuatkan undangan pernikahan saya...'
                  }
                  rows={4}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  loading={requestLoading}
                  className={cn(
                    'flex-1 text-white',
                    requestType === 'PREMIUM'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
                  )}
                >
                  Kirim Permintaan
                </Button>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                🚀 Permintaan akan diproses oleh admin dalam masa beta.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
