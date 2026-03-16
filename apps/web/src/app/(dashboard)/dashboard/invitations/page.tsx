'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitations, useDeleteInvitation, useUpdateInvitation } from '@/hooks/queries/use-invitations';
import { useUIStore } from '@/stores/ui-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import Link from 'next/link';

export default function InvitationsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleTogglePublish = async (inv: any) => {
    try {
      await updateInvitation.mutateAsync({
        id: inv.id,
        payload: { isPublished: !inv.isPublished },
      });
      addToast(
        inv.isPublished ? 'Undangan di-unpublish' : 'Undangan dipublish!',
        'success',
      );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Undangan Saya</h1>
          <p className="text-gray-500 mt-1">Kelola semua undangan digital Anda</p>
        </div>
        <Button onClick={() => router.push('/dashboard/invitations/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Undangan
        </Button>
      </div>

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
      ) : filtered.length === 0 ? (
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
                onClick={() => router.push('/dashboard/invitations/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Undangan Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {guestCount} tamu
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Tema: {templateName} • /{inv.slug}
                      </p>
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
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50',
                        )}
                        title={inv.isPublished ? 'Unpublish' : 'Publish'}
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
    </div>
  );
}
