'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitations, useDeleteInvitation, useUpdateInvitation } from '@/hooks/queries/use-invitations';
import { useInvitationStore } from '@/stores/invitation-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { RatingPopup } from '@/components/ui/rating-popup';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Plus,
  Mail,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Search,
  Calendar,
  Users,
  CheckCircle,
  FileEdit,
  AlertCircle,
  Sparkles,
  Crown,
  Zap,
  Star,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function InvitationsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const { isDirty, draft, currentStep } = useInvitationStore();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDraftConfirm, setDeleteDraftConfirm] = useState(false);
  const [ratingPopup, setRatingPopup] = useState<{
    open: boolean;
    templateId: string;
    templateName: string;
    templateSlug: string;
  }>({ open: false, templateId: '', templateName: '', templateSlug: '' });

  // Beta limit modal
  const [showBetaLimitModal, setShowBetaLimitModal] = useState(false);

  // Beta config — invitation limits per tier
  const [betaConfig, setBetaConfig] = useState<{
    isBeta: boolean;
    maxInvitations: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    api.get('/auth/beta-config').then(({ data }) => {
      setBetaConfig(data);
    }).catch(() => {});
  }, []);

  const { data, isLoading } = useInvitations({ limit: 50 });
  const deleteInvitation = useDeleteInvitation();
  const updateInvitation = useUpdateInvitation();

  const invitations = data?.data || [];
  const filtered = search
    ? invitations.filter((inv: any) =>
        inv.title.toLowerCase().includes(search.toLowerCase()) ||
        inv.slug.toLowerCase().includes(search.toLowerCase())
      )
    : invitations;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInvitation.mutateAsync(deleteId);
      addToast('Undangan berhasil dihapus', 'success');
      setDeleteId(null);
    } catch {
      addToast('Gagal menghapus undangan', 'error');
    }
  };

  // Helper: check if an invitation has complete data for publishing
  const getPublishMissingFields = (inv: any): string[] => {
    const missing: string[] = [];
    if (!inv.title) missing.push('Judul');
    if (!inv.slug) missing.push('Slug/URL');
    if (!inv.eventType) missing.push('Tipe acara');

    if (!inv.events || inv.events.length === 0) {
      missing.push('Minimal 1 acara');
    } else {
      const hasValidEvent = inv.events.some(
        (e: any) => e.eventName?.trim() && e.eventDate,
      );
      if (!hasValidEvent) missing.push('Acara harus punya nama & tanggal');
    }

    if (!inv.personProfiles || inv.personProfiles.length === 0) {
      missing.push('Minimal 1 profil');
    } else {
      const hasValidProfile = inv.personProfiles.some(
        (p: any) => p.fullName?.trim(),
      );
      if (!hasValidProfile) missing.push('Profil harus punya nama lengkap');
    }

    const hasTemplate = inv.templates?.length > 0;
    if (!hasTemplate) missing.push('Template undangan');

    return missing;
  };

  const handleTogglePublish = async (inv: any) => {
    try {
      const isPublishing = !inv.isPublished;

      // Validate completeness when publishing
      if (isPublishing) {
        const missingFields = getPublishMissingFields(inv);
        if (missingFields.length > 0) {
          addToast(
            `Tidak bisa publish — data belum lengkap: ${missingFields.join(', ')}. Silakan edit undangan terlebih dahulu.`,
            'error',
          );
          return;
        }
      }

      await updateInvitation.mutateAsync({
        id: inv.id,
        payload: { isPublished: isPublishing },
      });
      addToast(
        isPublishing ? 'Undangan dipublish!' : 'Undangan di-unpublish',
        'success',
      );

      // Show rating popup when publishing
      if (isPublishing) {
        const primaryTemplate = inv.templates?.[0]?.template;
        if (primaryTemplate) {
          setRatingPopup({
            open: true,
            templateId: primaryTemplate.id,
            templateName: primaryTemplate.name,
            templateSlug: primaryTemplate.slug,
          });
        }
      }
    } catch {
      addToast('Gagal mengubah status', 'error');
    }
  };

  const handleCopyLink = (inv: any) => {
    const templateSlug = inv.templates?.[0]?.template?.slug || 'default';
    const url = `${window.location.origin}/${inv.slug}/${templateSlug}`;
    navigator.clipboard.writeText(url);
    addToast('Link undangan disalin!', 'success');
  };

  const totalInvitations = invitations.length;
  const publishedCount = invitations.filter((inv: any) => inv.isPublished).length;
  const totalViews = invitations.reduce((sum: number, inv: any) => sum + (inv.viewCount || 0), 0);

  // Compute beta invitation limit for current user
  const userTier = user?.subscriptionType || 'BASIC';
  const tierLabel = userTier === 'FAST_SERVE' ? 'Enterprise' : userTier === 'PREMIUM' ? 'Premium' : 'Basic';
  const maxInv = betaConfig?.isBeta ? (betaConfig.maxInvitations?.[userTier] ?? 1) : 0;
  const limitReached = betaConfig?.isBeta && maxInv > 0 && totalInvitations >= maxInv;

  // Determine next upgrade tier
  const nextTier = userTier === 'BASIC' ? 'Premium' : userTier === 'PREMIUM' ? 'Enterprise' : null;
  const nextTierLimit = betaConfig?.isBeta
    ? userTier === 'BASIC'
      ? betaConfig.maxInvitations?.PREMIUM ?? 3
      : userTier === 'PREMIUM'
        ? betaConfig.maxInvitations?.FAST_SERVE ?? 1
        : 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Undangan Saya</h1>
          <p className="text-gray-500 mt-1">Kelola semua undangan digital Anda</p>
        </div>
        <Button
          onClick={() => {
            if (limitReached) {
              setShowBetaLimitModal(true);
              return;
            }
            router.push('/dashboard/invitations/new?new=1');
          }}
          className={limitReached ? 'opacity-80' : ''}
        >
          {limitReached ? <Lock className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Buat Undangan
        </Button>
      </div>

      {/* Beta invitation limit info */}
      {betaConfig?.isBeta && maxInv > 0 && (
        <div className={cn(
          'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm',
          limitReached
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-blue-50 border-blue-200 text-blue-700',
        )}>
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Mode Beta</strong>
            {' — '}
            {limitReached
              ? <>Batas {maxInv} undangan untuk akun {tierLabel} tercapai.{' '}
                  <button onClick={() => setShowBetaLimitModal(true)} className="underline font-semibold hover:no-underline">
                    Lihat opsi upgrade →
                  </button>
                </>
              : <>Akun {tierLabel} dapat membuat hingga {maxInv} undangan ({totalInvitations}/{maxInv} digunakan).</>
            }
          </div>
        </div>
      )}

      {/* ══════ Beta Limit Modal ══════ */}
      {showBetaLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative">
            {/* Close */}
            <button
              onClick={() => setShowBetaLimitModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header gradient */}
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 px-6 pt-8 pb-6 text-center border-b border-amber-100">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-200/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Batas Undangan Tercapai
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
                Invitee sedang dalam <strong>tahap beta</strong>. Selama masa beta, jumlah undangan yang bisa dibuat dibatasi untuk menjaga kualitas layanan.
              </p>
            </div>

            {/* Tier comparison */}
            <div className="px-6 py-5 space-y-4">
              {/* Current tier */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  userTier === 'BASIC' ? 'bg-blue-100' : userTier === 'PREMIUM' ? 'bg-amber-100' : 'bg-emerald-100',
                )}>
                  {userTier === 'BASIC' ? <Star className="w-5 h-5 text-blue-600" /> :
                   userTier === 'PREMIUM' ? <Crown className="w-5 h-5 text-amber-600" /> :
                   <Zap className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    Paket {tierLabel} <span className="text-xs font-normal text-gray-500">(Saat ini)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Maks {maxInv} undangan • {totalInvitations}/{maxInv} digunakan
                  </div>
                </div>
                <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Penuh</div>
              </div>

              {/* Upgrade options */}
              {userTier === 'BASIC' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opsi Upgrade</p>
                  {/* Premium */}
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3.5 border border-amber-200 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Premium</div>
                      <div className="text-xs text-gray-500">
                        Hingga {betaConfig?.maxInvitations?.PREMIUM ?? 3} undangan • Semua template • Export Excel
                      </div>
                    </div>
                    <Link
                      href="/dashboard/subscription"
                      onClick={() => setShowBetaLimitModal(false)}
                      className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      Upgrade <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {/* Enterprise */}
                  <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Enterprise</div>
                      <div className="text-xs text-gray-500">
                        Undangan dibuatkan admin • Custom kuota • Konsultasi desain
                      </div>
                    </div>
                    <Link
                      href="/dashboard/subscription"
                      onClick={() => setShowBetaLimitModal(false)}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      Request <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {userTier === 'PREMIUM' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Butuh lebih banyak?</p>
                  <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Enterprise</div>
                      <div className="text-xs text-gray-500">
                        Custom kuota undangan • Dibuatkan admin • Prioritas VIP
                      </div>
                    </div>
                    <Link
                      href="/dashboard/subscription"
                      onClick={() => setShowBetaLimitModal(false)}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      Request <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {userTier === 'FAST_SERVE' && (
                <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200 text-center">
                  <p className="text-sm text-blue-700">
                    Hubungi admin untuk penyesuaian kuota undangan Enterprise Anda.
                  </p>
                </div>
              )}

              {/* Why limited */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">Mengapa dibatasi?</strong> — Saat ini Invitee masih dalam <strong>fase beta</strong>.
                  Pembatasan ini dilakukan untuk menjaga stabilitas server dan kualitas layanan.
                  Setelah launching resmi, kuota akan disesuaikan sesuai paket Anda.
                  Terima kasih atas pengertiannya! 🙏
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <Link
                href="/dashboard/subscription"
                onClick={() => setShowBetaLimitModal(false)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                Lihat Semua Paket <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBetaLimitModal(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Resume Banner */}
      {/* Draft card is now shown inline within the invitation list below */}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalInvitations}</p>
              <p className="text-xs text-gray-500">Total Undangan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Dilihat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari undangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Invitation List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 && !(isDirty && draft.title) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-200 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {search ? 'Tidak ada undangan ditemukan' : 'Belum ada undangan'}
            </h3>
            <p className="text-gray-500 mt-1 text-sm">
              {search
                ? 'Coba kata kunci lain'
                : 'Buat undangan pertama Anda sekarang!'}
            </p>
            {!search && (
              <Button
                className="mt-6"
                onClick={() => router.push('/dashboard/invitations/new?new=1')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Undangan Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Draft Card — Zustand draft shown as first item in list */}
          {isDirty && draft.title && (
            <Card className="border-amber-300 bg-amber-50/40 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Draft thumbnail */}
                  <div className="w-16 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center border-2 border-dashed border-amber-300">
                    <FileEdit className="w-6 h-6 text-amber-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {draft.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-700 border-amber-300">
                        Draft Lokal
                      </Badge>
                      <Badge variant="secondary" className="shrink-0">
                        Unpublished
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {draft.eventType && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {EVENT_TYPE_LABELS[draft.eventType] || draft.eventType}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <FileEdit className="w-3.5 h-3.5" />
                        Step {currentStep + 1}/7
                      </span>
                    </div>

                    {/* Data completeness warning */}
                    {(() => {
                      const missing: string[] = [];
                      if (!draft.title) missing.push('Judul');
                      if (!draft.slug) missing.push('Slug/URL');
                      if (!draft.eventType) missing.push('Tipe acara');
                      const hasEvent = draft.events?.some(e => e.eventName?.trim() && e.eventDate);
                      if (!hasEvent) missing.push('Acara (nama & tanggal)');
                      const hasProfile = draft.personProfiles?.some(p => p.fullName?.trim());
                      if (!hasProfile) missing.push('Profil (nama lengkap)');
                      if (!draft.templateId) missing.push('Template');

                      if (missing.length > 0) {
                        return (
                          <div className="flex items-start gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-600">
                              Belum bisa dipublish — lengkapi: {missing.join(', ')}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Data lengkap — submit terlebih dahulu untuk bisa publish
                        </p>
                      );
                    })()}

                    <p className="text-xs text-gray-400 mt-1">
                      Draft belum disimpan ke server • /{draft.slug || '...'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                      title="Tidak bisa publish — draft belum disimpan ke server"
                      disabled
                    >
                      <ToggleLeft className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      onClick={() => router.push('/dashboard/invitations/new')}
                      className="ml-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Lanjutkan
                    </Button>
                    <button
                      onClick={() => setDeleteDraftConfirm(true)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {filtered.map((inv: any) => {
            const templateSlug = inv.templates?.[0]?.template?.slug || 'default';
            const templateName = inv.templates?.[0]?.template?.name || 'Belum dipilih';
            const firstEvent = inv.events?.[0];
            const eventDate = firstEvent?.eventDate
              ? new Date(firstEvent.eventDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : null;
            const guestCount = inv.guests?.length || 0;

            return (
              <Card
                key={inv.id}
                className="hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Template thumbnail */}
                    <div className="w-16 h-20 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                      <span className="text-lg font-serif text-primary-300 absolute">
                        {inv.title.charAt(0)}
                      </span>
                      <img
                        src={`/images/templates/${templateSlug}.svg`}
                        alt={templateName}
                        className="w-full h-full object-cover relative z-[1]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {inv.title}
                        </h3>
                        <Badge
                          variant={inv.isPublished ? 'success' : 'secondary'}
                          className="shrink-0"
                        >
                          {inv.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {EVENT_TYPE_LABELS[inv.eventType] || inv.eventType}
                        </span>
                        {eventDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {eventDate}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {inv.viewCount} dilihat
                        </span>
                        <Link
                          href={`/dashboard/contacts?invitationId=${inv.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {guestCount} tamu →
                        </Link>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Tema: {templateName} • /{inv.slug}
                      </p>

                      {/* Data completeness warning for unpublished invitations */}
                      {!inv.isPublished && (() => {
                        const missing = getPublishMissingFields(inv);
                        if (missing.length > 0) {
                          return (
                            <div className="flex items-start gap-1.5 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-600">
                                Belum bisa dipublish — lengkapi: {missing.join(', ')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLink(inv)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Salin Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/${inv.slug}/${templateSlug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Undangan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleTogglePublish(inv)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          inv.isPublished
                            ? 'text-green-600 hover:bg-green-50'
                            : getPublishMissingFields(inv).length > 0
                              ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50',
                        )}
                        title={
                          inv.isPublished
                            ? 'Unpublish'
                            : getPublishMissingFields(inv).length > 0
                              ? 'Data belum lengkap — tidak bisa dipublish'
                              : 'Publish'
                        }
                      >
                        {inv.isPublished ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/dashboard/invitations/${inv.id}/edit`}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(inv.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Undangan"
        description="Apakah Anda yakin ingin menghapus undangan ini? Semua data terkait (tamu, RSVP, galeri) akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        loading={deleteInvitation.isPending}
      />

      {/* Delete Draft Confirmation Modal */}
      <ConfirmModal
        open={deleteDraftConfirm}
        onClose={() => setDeleteDraftConfirm(false)}
        onConfirm={() => {
          useInvitationStore.getState().reset();
          setDeleteDraftConfirm(false);
          addToast('Draft dihapus', 'info');
        }}
        title="Hapus Draft Lokal"
        description="Apakah Anda yakin ingin menghapus draft ini? Semua data yang sudah diisi akan hilang. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus Draft"
        variant="danger"
      />

      {/* Rating Popup — shown after publishing */}
      <RatingPopup
        open={ratingPopup.open}
        onClose={() => setRatingPopup((prev) => ({ ...prev, open: false }))}
        templateId={ratingPopup.templateId}
        templateName={ratingPopup.templateName}
        templateSlug={ratingPopup.templateSlug}
      />
    </div>
  );
}
