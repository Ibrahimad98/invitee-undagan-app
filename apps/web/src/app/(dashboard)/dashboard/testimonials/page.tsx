'use client';

import { useState, useMemo } from 'react';
import { useTestimonials, useMyTestimonials, useMyTemplatesForReview, useCreateTestimonial, useApproveTestimonial, useDeleteTestimonial } from '@/hooks/queries/use-testimonials';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Avatar } from '@/components/ui/avatar';
import {
  Star,
  CheckCircle,
  Clock,
  Trash2,
  Shield,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Palette,
  MousePointerClick,
  HeartHandshake,
  BarChart3,
  TrendingUp,
  StickyNote,
  ChevronLeft,
  Sparkles,
  FileText,
} from 'lucide-react';

type FilterTab = 'all' | 'approved' | 'pending';

/* ─── Rating categories ─── */
const RATING_CATEGORIES = [
  {
    key: 'ratingDesain' as const,
    label: 'Desain & Tampilan',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Kualitas visual dan estetika undangan',
  },
  {
    key: 'ratingKemudahan' as const,
    label: 'Kemudahan Penggunaan',
    icon: MousePointerClick,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Kemudahan dalam membuat undangan',
  },
  {
    key: 'ratingLayanan' as const,
    label: 'Kepuasan Layanan',
    icon: HeartHandshake,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Kualitas layanan dan dukungan',
  },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Kurang Baik',
  2: 'Cukup',
  3: 'Baik',
  4: 'Sangat Baik',
  5: 'Luar Biasa!',
};

/* ─── Star Rating Component ─── */
function StarRating({
  value,
  onChange,
  hoverValue,
  onHover,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  hoverValue?: number;
  onHover?: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-7 h-7';
  const padClass = size === 'sm' ? 'p-0' : 'p-0.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onHover?.(i + 1)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onChange?.(i + 1)}
          className={`${padClass} transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              i < ((hoverValue && hoverValue > 0 ? hoverValue : undefined) || value)
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Category Rating Row (for display) ─── */
function CategoryRatingDisplay({ testimonial }: { testimonial: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
      {RATING_CATEGORIES.map((cat) => (
        <div key={cat.key} className="flex items-center gap-2">
          <cat.icon className={`w-3.5 h-3.5 ${cat.color} flex-shrink-0`} />
          <span className="text-xs text-gray-500 flex-shrink-0">{cat.label}:</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < (testimonial[cat.key] || 0)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   USER VIEW — Template-based reviews
   ═══════════════════════════════════════════════════ */
function UserTestimonialView() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const createTestimonial = useCreateTestimonial();
  const { data: templatesData, isLoading: loadingTemplates } = useMyTemplatesForReview();

  const templateItems = templatesData?.data || [];

  // Active review form state
  const [reviewingTemplateId, setReviewingTemplateId] = useState<string | null>(null);
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

  const overallRating = Math.round(
    (ratings.ratingDesain + ratings.ratingKemudahan + ratings.ratingLayanan) / 3
  );

  const reviewingTemplate = templateItems.find((t) => t.template.id === reviewingTemplateId);

  const handleStartReview = (templateId: string) => {
    setReviewingTemplateId(templateId);
    setRatings({ ratingDesain: 5, ratingKemudahan: 5, ratingLayanan: 5 });
    setHoverRatings({ ratingDesain: 0, ratingKemudahan: 0, ratingLayanan: 0 });
    setMessage('');
    setNotes('');
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      addToast('Silakan tulis ulasan Anda', 'error');
      return;
    }
    if (!reviewingTemplateId) return;

    try {
      await createTestimonial.mutateAsync({
        templateId: reviewingTemplateId,
        userName: user?.fullName || 'Anonim',
        message: message.trim(),
        rating: overallRating,
        ratingDesain: ratings.ratingDesain,
        ratingKemudahan: ratings.ratingKemudahan,
        ratingLayanan: ratings.ratingLayanan,
        notes: notes.trim() || undefined,
      });
      addToast('Terima kasih! Ulasan Anda telah dikirim dan menunggu persetujuan.', 'success');
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal mengirim ulasan';
      addToast(msg, 'error');
    }
  };

  // Loading state
  if (loadingTemplates) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
          <p className="text-gray-500 mt-1">Beri ulasan untuk template yang telah Anda gunakan</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Just submitted success state
  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
          <p className="text-gray-500 mt-1">Beri ulasan untuk template yang telah Anda gunakan</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Terima Kasih!</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Ulasan Anda untuk template <strong>{reviewingTemplate?.template.name}</strong> telah berhasil dikirim
              dan sedang menunggu persetujuan admin.
            </p>
            <Button variant="outline" onClick={() => { setSubmitted(false); setReviewingTemplateId(null); }}>
              Kembali ke Daftar Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review form for a specific template
  if (reviewingTemplateId && reviewingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ulasan Template</h1>
            <p className="text-gray-500 mt-1">Beri nilai untuk template <strong>{reviewingTemplate.template.name}</strong></p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setReviewingTemplateId(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </div>

        {/* Template info card */}
        <Card className="border-primary-100 bg-primary-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={`/images/templates/${reviewingTemplate.template.slug}.svg`}
                alt={reviewingTemplate.template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-2xl">💌</div>';
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{reviewingTemplate.template.name}</h3>
              <p className="text-sm text-gray-500">Digunakan di undangan: {reviewingTemplate.invitationTitle}</p>
              <Badge variant="secondary" className="mt-1 text-xs capitalize">{reviewingTemplate.template.category}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary-100 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Bagaimana pengalaman Anda?</h2>
              <p className="text-sm text-gray-500">Nilai template ini di 3 kategori berikut</p>
            </div>

            {/* 3 Category Ratings */}
            <div className="space-y-5">
              {RATING_CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className={`p-4 rounded-xl border border-gray-100 ${cat.bgColor}/30 space-y-2`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                      <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-[46px]">
                    <StarRating
                      value={ratings[cat.key]}
                      onChange={(v) => setRatings((prev) => ({ ...prev, [cat.key]: v }))}
                      hoverValue={hoverRatings[cat.key]}
                      onHover={(v) => setHoverRatings((prev) => ({ ...prev, [cat.key]: v }))}
                    />
                    <span className="text-xs text-gray-400 min-w-[80px]">
                      {RATING_LABELS[hoverRatings[cat.key] || ratings[cat.key]]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall rating indicator */}
            <div className="text-center p-3 bg-primary-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Rating Keseluruhan</p>
              <div className="flex items-center justify-center gap-2">
                <StarRating value={overallRating} size="sm" />
                <span className="text-sm font-bold text-primary-700">{overallRating}/5</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ulasan Anda</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ceritakan pengalaman Anda menggunakan template ini..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
            </div>

            {/* Notes / Catatan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-gray-400" />
                Catatan Tambahan
                <span className="text-xs text-gray-400 font-normal">(opsional)</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Saran, kritik, atau hal lain yang ingin Anda sampaikan..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-gray-400 text-right">{notes.length}/300</p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={createTestimonial.isPending || !message.trim()}
              className="w-full flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {createTestimonial.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Ulasan Anda akan ditampilkan setelah disetujui oleh admin. Anda hanya bisa memberi ulasan sekali per template.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No published invitations / no templates used
  if (templateItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
          <p className="text-gray-500 mt-1">Beri ulasan untuk template yang telah Anda gunakan</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Belum Ada Template untuk Diulas</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Anda belum memiliki undangan yang dipublish. Setelah Anda mempublish undangan,
              Anda bisa memberikan ulasan untuk template yang digunakan.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/invitations'}>
              Lihat Undangan Saya
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main view — list of templates the user has used
  const unreviewedCount = templateItems.filter((t) => !t.hasReviewed).length;
  const reviewedCount = templateItems.filter((t) => t.hasReviewed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
        <p className="text-gray-500 mt-1">Beri ulasan untuk template yang telah Anda gunakan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{templateItems.length}</p>
              <p className="text-xs text-gray-500">Template Digunakan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviewedCount}</p>
              <p className="text-xs text-gray-500">Sudah Diulas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreviewedCount}</p>
              <p className="text-xs text-gray-500">Belum Diulas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unreviewed templates */}
      {unreviewedCount > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Menunggu Ulasan Anda ({unreviewedCount})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateItems
              .filter((t) => !t.hasReviewed)
              .map((item) => (
                <Card key={item.template.id} className="overflow-hidden hover:shadow-md transition-shadow border-yellow-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={`/images/templates/${item.template.slug}.svg`}
                          alt={item.template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-xl">💌</div>';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.template.name}</h3>
                        <p className="text-xs text-gray-500 truncate">Undangan: {item.invitationTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] capitalize">{item.template.category}</Badge>
                          {item.template.ratingCount > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {item.template.ratingAvg.toFixed(1)} ({item.template.ratingCount})
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleStartReview(item.template.id)}>
                        <Star className="w-3.5 h-3.5 mr-1" />
                        Ulas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Reviewed templates */}
      {reviewedCount > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Sudah Diulas ({reviewedCount})
          </h2>
          <div className="space-y-4">
            {templateItems
              .filter((t) => t.hasReviewed && t.review)
              .map((item) => (
                <Card key={item.template.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={`/images/templates/${item.template.slug}.svg`}
                          alt={item.template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-lg">💌</div>';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-gray-900">{item.template.name}</h3>
                          {item.review!.isApproved ? (
                            <Badge variant="success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Disetujui
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              <Clock className="w-3 h-3 mr-1" />
                              Menunggu
                            </Badge>
                          )}
                        </div>

                        {/* Category ratings */}
                        <CategoryRatingDisplay testimonial={item.review!} />

                        <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                          &ldquo;{item.review!.message}&rdquo;
                        </p>

                        {item.review!.notes && (
                          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <StickyNote className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Catatan</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{item.review!.notes}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.review!.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CUSTOMER FEEDBACK SECTION — Aggregate stats per category
   ═══════════════════════════════════════════════════ */
function CustomerFeedbackSection({ testimonials }: { testimonials: any[] }) {
  const approved = testimonials.filter((t: any) => t.isApproved);

  const stats = useMemo(() => {
    if (approved.length === 0) return null;

    const sum = { desain: 0, kemudahan: 0, layanan: 0 };
    approved.forEach((t: any) => {
      sum.desain += t.ratingDesain || 0;
      sum.kemudahan += t.ratingKemudahan || 0;
      sum.layanan += t.ratingLayanan || 0;
    });

    const count = approved.length;
    return {
      desain: sum.desain / count,
      kemudahan: sum.kemudahan / count,
      layanan: sum.layanan / count,
      overall: (sum.desain + sum.kemudahan + sum.layanan) / (count * 3),
      total: count,
    };
  }, [approved]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada feedback</p>
          <p className="text-sm text-gray-400 mt-1">Data feedback akan muncul setelah ada testimoni yang disetujui.</p>
        </CardContent>
      </Card>
    );
  }

  const categoryData = [
    { label: 'Desain & Tampilan', avg: stats.desain, icon: Palette, color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
    { label: 'Kemudahan Penggunaan', avg: stats.kemudahan, icon: MousePointerClick, color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { label: 'Kepuasan Layanan', avg: stats.layanan, icon: HeartHandshake, color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-700' },
  ];

  // Distribution bars per rating (1-5) for approved testimonials
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
    const count = approved.filter((t: any) => Math.round(((t.ratingDesain || 0) + (t.ratingKemudahan || 0) + (t.ratingLayanan || 0)) / 3) === r).length;
    return { rating: r, count, pct: stats.total > 0 ? (count / stats.total) * 100 : 0 };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-bold text-gray-900">Customer Feedback</h2>
        <Badge variant="default">{stats.total} ulasan</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — Overall + Category Bars */}
        <Card>
          <CardContent className="p-5 space-y-5">
            {/* Overall score */}
            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
              <p className="text-3xl font-bold text-primary-700">{stats.overall.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(stats.overall) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">Rating Keseluruhan</p>
            </div>

            {/* Per-category progress bars */}
            <div className="space-y-4">
              {categoryData.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${cat.lightColor} flex items-center justify-center`}>
                        <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${cat.textColor}`}>
                      {cat.avg.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                      style={{ width: `${(cat.avg / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right — Rating distribution */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Distribusi Rating</h3>
            </div>
            <div className="space-y-3">
              {ratingDistribution.map((d) => (
                <div key={d.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 w-14 justify-end flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">{d.rating}</span>
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent notes */}
            {(() => {
              const recentNotes = approved.filter((t: any) => t.notes).slice(0, 3);
              if (recentNotes.length === 0) return null;
              return (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 mb-3">
                    <StickyNote className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-semibold text-gray-700">Catatan Terbaru</h4>
                  </div>
                  <div className="space-y-2">
                    {recentNotes.map((t: any) => (
                      <div key={t.id} className="p-2.5 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 leading-relaxed">{t.notes}</p>
                        <p className="text-[10px] text-gray-400 mt-1">— {t.userName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN VIEW — Full management: list, approve, delete
   ═══════════════════════════════════════════════════ */
function AdminTestimonialView() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { addToast } = useUIStore();

  const { data: allData, isLoading: loadingAll } = useTestimonials(1, 50, true);
  const approveTestimonial = useApproveTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const allTestimonials = allData?.data || [];

  const filteredTestimonials = allTestimonials.filter((t: any) => {
    if (activeTab === 'approved') return t.isApproved;
    if (activeTab === 'pending') return !t.isApproved;
    return true;
  });

  const approvedCount = allTestimonials.filter((t: any) => t.isApproved).length;
  const pendingCount = allTestimonials.filter((t: any) => !t.isApproved).length;
  const avgRating =
    allTestimonials.length > 0
      ? allTestimonials.reduce((sum: number, t: any) => sum + t.rating, 0) / allTestimonials.length
      : 0;

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await approveTestimonial.mutateAsync({ id, isApproved });
      addToast(isApproved ? 'Testimoni disetujui' : 'Testimoni ditolak', 'success');
    } catch {
      addToast('Gagal memperbarui testimoni', 'error');
    }
  };

  const [deleteTestimonialId, setDeleteTestimonialId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTestimonialId) return;
    try {
      await deleteTestimonial.mutateAsync(deleteTestimonialId);
      addToast('Testimoni berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus testimoni', 'error');
    } finally {
      setDeleteTestimonialId(null);
    }
  };

  const tabs = [
    { id: 'all', label: `Semua (${allTestimonials.length})` },
    { id: 'approved', label: `Disetujui (${approvedCount})` },
    { id: 'pending', label: `Menunggu (${pendingCount})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Testimoni</h1>
        <p className="text-gray-500 mt-1">Kelola testimoni dari pengguna</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allTestimonials.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-xs text-gray-500">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-gray-500">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating Rata-rata</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Customer Feedback Section ═══ */}
      <CustomerFeedbackSection testimonials={allTestimonials} />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Testimonial List */}
      {loadingAll ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">Belum ada testimoni</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'pending'
                ? 'Tidak ada testimoni yang menunggu persetujuan'
                : 'Testimoni akan muncul setelah pengguna memberikan ulasan'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial: any) => (
            <Card key={testimonial.id} className={!testimonial.isApproved ? 'border-yellow-200 bg-yellow-50/30' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                    <Avatar name={testimonial.userName || '?'} />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{testimonial.userName}</h3>
                        {testimonial.isApproved ? (
                          <Badge variant="success">
                            <Shield className="w-3 h-3 mr-1" />
                            Disetujui
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="w-3 h-3 mr-1" />
                            Menunggu
                          </Badge>
                        )}
                        {testimonial.template && (
                          <Badge variant="secondary" className="text-[10px]">
                            <Palette className="w-3 h-3 mr-1" />
                            {testimonial.template.name}
                          </Badge>
                        )}
                      </div>                      {/* Category ratings */}
                      <CategoryRatingDisplay testimonial={testimonial} />

                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        &ldquo;{testimonial.message}&rdquo;
                      </p>

                      {/* Notes */}
                      {testimonial.notes && (
                        <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <StickyNote className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Catatan</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{testimonial.notes}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(testimonial.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    {!testimonial.isApproved && (
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Setujui"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                    {testimonial.isApproved && (
                      <button
                        onClick={() => handleApprove(testimonial.id, false)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Batalkan Persetujuan"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTestimonialId(testimonial.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTestimonialId}
        onClose={() => setDeleteTestimonialId(null)}
        onConfirm={handleDelete}
        title="Hapus Testimoni"
        description="Apakah Anda yakin ingin menghapus testimoni ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Hapus"
        loading={deleteTestimonial.isPending}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE — Route based on user role
   ═══════════════════════════════════════════════════ */
export default function TestimonialsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return isAdmin ? <AdminTestimonialView /> : <UserTestimonialView />;
}
