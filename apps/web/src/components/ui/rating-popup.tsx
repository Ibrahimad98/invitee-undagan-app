'use client';

import { useState, useEffect } from 'react';
import { Star, Send, X, MessageCircle, Palette, MousePointerClick, HeartHandshake, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTestimonial } from '@/hooks/queries/use-testimonials';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

interface RatingPopupProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  templateSlug: string;
}

const RATING_CATEGORIES = [
  {
    key: 'ratingDesain' as const,
    label: 'Desain & Tampilan',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    key: 'ratingKemudahan' as const,
    label: 'Kemudahan Penggunaan',
    icon: MousePointerClick,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'ratingLayanan' as const,
    label: 'Kepuasan Layanan',
    icon: HeartHandshake,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Kurang Baik',
  2: 'Cukup',
  3: 'Baik',
  4: 'Sangat Baik',
  5: 'Luar Biasa!',
};

export function RatingPopup({ open, onClose, templateId, templateName, templateSlug }: RatingPopupProps) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const createTestimonial = useCreateTestimonial();

  const [ratings, setRatings] = useState({
    ratingDesain: 5,
    ratingKemudahan: 5,
    ratingLayanan: 5,
  });
  const [hoverRatings, setHoverRatings] = useState({
    ratingDesain: 0,
    ratingKemudahan: 0,
    ratingLayanan: 0,
  });
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setRatings({ ratingDesain: 5, ratingKemudahan: 5, ratingLayanan: 5 });
      setHoverRatings({ ratingDesain: 0, ratingKemudahan: 0, ratingLayanan: 0 });
      setMessage('');
      setNotes('');
      setSubmitted(false);
    }
  }, [open]);

  const overallRating = Math.round(
    (ratings.ratingDesain + ratings.ratingKemudahan + ratings.ratingLayanan) / 3
  );

  const handleSubmit = async () => {
    if (!message.trim()) {
      addToast('Silakan tulis ulasan Anda', 'error');
      return;
    }

    try {
      await createTestimonial.mutateAsync({
        templateId,
        userName: user?.fullName || 'Anonim',
        message: message.trim(),
        rating: overallRating,
        ratingDesain: ratings.ratingDesain,
        ratingKemudahan: ratings.ratingKemudahan,
        ratingLayanan: ratings.ratingLayanan,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal mengirim ulasan';
      // If already reviewed, just close silently
      if (msg.includes('sudah memberikan')) {
        onClose();
        return;
      }
      addToast(msg, 'error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Success state */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Star className="w-8 h-8 text-green-600 fill-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Terima Kasih!</h2>
            <p className="text-gray-500 text-sm">
              Ulasan Anda untuk template <strong>{templateName}</strong> telah dikirim
              dan menunggu persetujuan admin.
            </p>
            <Button onClick={onClose} variant="outline" className="mt-2">
              Tutup
            </Button>
          </div>
        ) : (
          /* Review form */
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="text-center space-y-2 pr-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Beri Ulasan Template</h2>
              <p className="text-sm text-gray-500">
                Bagaimana pengalaman Anda menggunakan <strong>{templateName}</strong>?
              </p>
            </div>

            {/* Category Ratings */}
            <div className="space-y-3">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{cat.label}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [cat.key]: i + 1 }))}
                            onMouseLeave={() => setHoverRatings((prev) => ({ ...prev, [cat.key]: 0 }))}
                            onClick={() => setRatings((prev) => ({ ...prev, [cat.key]: i + 1 }))}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                i < ((hoverRatings[cat.key] > 0 ? hoverRatings[cat.key] : undefined) || ratings[cat.key])
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {RATING_LABELS[hoverRatings[cat.key] || ratings[cat.key]]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall */}
            <div className="text-center py-2 bg-primary-50 rounded-lg">
              <p className="text-[10px] text-gray-500">Rating Keseluruhan</p>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < overallRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-primary-700 ml-1">{overallRating}/5</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Ulasan</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ceritakan pengalaman Anda menggunakan template ini..."
                rows={3}
                maxLength={500}
              />
              <p className="text-[10px] text-gray-400 text-right">{message.length}/500</p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <StickyNote className="w-3 h-3 text-gray-400" />
                Catatan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Saran atau kritik..."
                rows={2}
                maxLength={300}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Nanti Saja
              </Button>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={createTestimonial.isPending || !message.trim()}
              >
                <Send className="w-4 h-4" />
                {createTestimonial.isPending ? 'Mengirim...' : 'Kirim'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
