'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

const PREMIUM_FEATURES = [
  'Akses semua template premium',
  'Kuota hingga 2000 tamu',
  'Export data ke Excel',
  'Download PDF undangan per tamu',
  'Unlimited galeri foto',
  'Prioritas dukungan',
];

export function PremiumUpgradeModal({ open, onClose, featureName }: PremiumUpgradeModalProps) {
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-200">
          <Crown className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900">Fitur Premium</h3>
          {featureName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">{featureName}</span>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Fitur ini hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk menikmati semua keunggulan.
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full text-left space-y-2 bg-gray-50 p-4 rounded-xl">
          {PREMIUM_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={() => {
              onClose();
              router.push('/dashboard/subscription');
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Lihat Paket Premium
            <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Nanti Saja
          </Button>
        </div>
      </div>
    </Modal>
  );
}
