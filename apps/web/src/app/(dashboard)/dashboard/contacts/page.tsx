'use client';

import { useState } from 'react';
import { useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest, useImportGuests, useMarkGuestSent } from '@/hooks/queries/use-guests';
import { useInvitations } from '@/hooks/queries/use-invitations';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ATTENDANCE_LABELS, SENT_VIA } from '@invitee/shared';
import {
  Plus,
  Trash2,
  Edit2,
  Send,
  Copy,
  Upload,
  Users,
  CheckCircle,
  Clock,
  Search,
  Download,
  X,
  MousePointerClick,
} from 'lucide-react';

interface GuestForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  numberOfGuests: number;
}

const initialGuestForm: GuestForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  numberOfGuests: 1,
};

export default function ContactsPage() {
  const { addToast } = useUIStore();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [guestForm, setGuestForm] = useState<GuestForm>(initialGuestForm);
  const [csvText, setCsvText] = useState('');
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);

  const { data: invitationsData } = useInvitations({ limit: 100 });
  const invitations = invitationsData?.data || [];
  const invitationOptions = invitations.map((inv: any) => ({ value: inv.id, label: inv.title }));

  const { data: guestsData, isLoading } = useGuests(
    selectedInvitationId,
    selectedInvitationId ? { search } : undefined,
  );
  const guests = guestsData?.data || [];

  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const importGuests = useImportGuests();
  const markSent = useMarkGuestSent();

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setGuestForm(initialGuestForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: any) => {
    setEditingGuest(guest);
    setGuestForm({
      name: guest.name,
      phone: guest.phone || '',
      email: guest.email || '',
      address: guest.address || '',
      numberOfGuests: guest.numberOfGuests || 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveGuest = async () => {
    if (!guestForm.name) {
      addToast('Nama tamu wajib diisi', 'error');
      return;
    }
    try {
      if (editingGuest) {
        await updateGuest.mutateAsync({
          invitationId: selectedInvitationId,
          id: editingGuest.id,
          payload: guestForm,
        });
        addToast('Tamu berhasil diperbarui', 'success');
      } else {
        await createGuest.mutateAsync({
          invitationId: selectedInvitationId,
          payload: { ...guestForm, invitationId: selectedInvitationId },
        });
        addToast('Tamu berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal menyimpan tamu', 'error');
    }
  };

  const handleDeleteGuest = async () => {
    if (!deleteGuestId) return;
    try {
      await deleteGuest.mutateAsync({ invitationId: selectedInvitationId, id: deleteGuestId });
      addToast('Tamu berhasil dihapus', 'success');
    } catch (error: any) {
      addToast('Gagal menghapus tamu', 'error');
    } finally {
      setDeleteGuestId(null);
    }
  };

  const handleMarkSent = async (guestId: string) => {
    try {
      await markSent.mutateAsync({
        invitationId: selectedInvitationId,
        id: guestId,
        sentVia: 'WHATSAPP',
      });
      addToast('Status pengiriman diperbarui', 'success');
    } catch (error: any) {
      addToast('Gagal memperbarui status', 'error');
    }
  };

  const handleImport = async () => {
    try {
      const lines = csvText.trim().split('\n').filter(Boolean);
      const guests = lines.map((line) => {
        const [name, phone, email, address] = line.split(',').map((s) => s.trim());
        return { name, phone: phone || '', email: email || '', address: address || '', numberOfGuests: 1 };
      });
      await importGuests.mutateAsync({
        invitationId: selectedInvitationId,
        payload: { guests },
      });
      addToast(`${guests.length} tamu berhasil diimpor`, 'success');
      setIsImportModalOpen(false);
      setCsvText('');
    } catch (error: any) {
      addToast('Gagal mengimpor tamu', 'error');
    }
  };

  const handleCopyLink = (guest: any) => {
    const invitation = invitations.find((inv: any) => inv.id === selectedInvitationId);
    if (!invitation) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    // Use the template slug from the invitation, fallback to 'default'
    const templateSlug = invitation.templates?.[0]?.template?.slug || 'default';
    const url = `${baseUrl}/${invitation.slug}/${templateSlug}?kpd=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(url);
    addToast('Link undangan disalin!', 'success');
  };

  const totalGuests = guests.length;
  const sentCount = guests.filter((g: any) => g.sentAt).length;
  const notSentCount = totalGuests - sentCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Tamu</h1>
          <p className="text-gray-500 mt-1">Kelola tamu undangan Anda</p>
        </div>
      </div>

      {/* Invitation Selector */}
      <Card>
        <CardContent className="p-4">
          <Select
            label="Pilih Undangan"
            placeholder="Pilih undangan untuk melihat daftar tamu..."
            options={invitationOptions}
            value={selectedInvitationId}
            onChange={(e) => setSelectedInvitationId(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Empty State — No invitation selected */}
      {!selectedInvitationId && (
        <Card>
          <CardContent className="p-0">
            <div className="py-16 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <MousePointerClick className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700">
                Belum ada undangan yang dipilih
              </h3>
              <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto">
                Silakan pilih undangan pada dropdown di atas untuk menampilkan dan mengelola daftar tamu.
              </p>
              {invitations.length === 0 && (
                <p className="text-xs text-amber-500 mt-3">
                  Anda belum memiliki undangan. Buat undangan terlebih dahulu untuk mulai menambahkan tamu.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedInvitationId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGuests}</p>
                  <p className="text-xs text-gray-500">Total Tamu</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sentCount}</p>
                  <p className="text-xs text-gray-500">Terkirim</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notSentCount}</p>
                  <p className="text-xs text-gray-500">Belum Kirim</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari tamu..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={handleOpenAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tamu
              </Button>
            </div>
          </div>

          {/* Guest List */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : guests.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="mt-4 text-gray-500 font-medium">Belum ada tamu</p>
                  <p className="text-sm text-gray-400 mt-1">Tambahkan tamu pertama Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Telepon</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {guests.map((guest: any) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">{guest.name}</p>
                              {guest.email && (
                                <p className="text-xs text-gray-400">{guest.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.phone || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.numberOfGuests}</td>
                          <td className="px-4 py-3">
                            {guest.sentAt ? (
                              <Badge variant="success">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Terkirim {guest.sentVia && `(${guest.sentVia})`}
                              </Badge>
                            ) : (
                              <Badge variant="warning">
                                <Clock className="w-3 h-3 mr-1" />
                                Belum
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleCopyLink(guest)}
                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                                title="Salin Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              {!guest.sentAt && (
                                <button
                                  onClick={() => handleMarkSent(guest.id)}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                  title="Tandai Terkirim"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(guest)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteGuestId(guest.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Guest Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGuest ? 'Edit Tamu' : 'Tambah Tamu'}>
        <div className="space-y-4">
          <Input
            label="Nama Tamu"
            placeholder="Nama lengkap tamu"
            value={guestForm.name}
            onChange={(e) => setGuestForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Nomor Telepon"
            placeholder="08123456789"
            value={guestForm.phone}
            onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Email"
            placeholder="email@example.com"
            value={guestForm.email}
            onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Alamat"
            placeholder="Alamat tamu"
            value={guestForm.address}
            onChange={(e) => setGuestForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Input
            label="Jumlah Tamu"
            type="number"
            min={1}
            value={guestForm.numberOfGuests}
            onChange={(e) => setGuestForm((f) => ({ ...f, numberOfGuests: parseInt(e.target.value) || 1 }))}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveGuest} loading={createGuest.isPending || updateGuest.isPending}>
              {editingGuest ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import CSV Modal */}
      <Modal open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Tamu dari CSV">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Format: <code className="bg-gray-100 px-1 rounded">Nama, Telepon, Email, Alamat</code> (satu tamu per baris)
          </p>
          <textarea
            className="w-full h-40 border border-gray-300 rounded-lg p-3 text-sm font-mono resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder={`Budi Santoso, 081234567890, budi@email.com, Jakarta\nSari Wulandari, 082345678901, , Bandung`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Batal</Button>
            <Button onClick={handleImport} loading={importGuests.isPending}>
              <Upload className="w-4 h-4 mr-2" />
              Import {csvText.trim().split('\n').filter(Boolean).length} Tamu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteGuestId}
        onClose={() => setDeleteGuestId(null)}
        onConfirm={handleDeleteGuest}
        title="Hapus Tamu"
        description="Apakah Anda yakin ingin menghapus tamu ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Hapus"
        loading={deleteGuest.isPending}
      />
    </div>
  );
}
