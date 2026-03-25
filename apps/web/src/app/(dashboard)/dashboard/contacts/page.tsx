'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest, useImportGuests, useImportGuestsExcel, useMarkGuestSent } from '@/hooks/queries/use-guests';
import { useInvitations } from '@/hooks/queries/use-invitations';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumUpgradeModal } from '@/components/ui/premium-upgrade-modal';
import { ATTENDANCE_LABELS, SENT_VIA } from '@invitee/shared';
import { api } from '@/lib/api';
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
  FileSpreadsheet,
  FileDown,
  Crown,
  Shield,
  ChevronDown,
  User,
  MessageCircle,
  Play,
  Pause,
  Eye,
  AlertTriangle,
  Phone,
  ShieldAlert,
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [guestForm, setGuestForm] = useState<GuestForm>(initialGuestForm);
  const [csvText, setCsvText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [premiumModal, setPremiumModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
  const [showWaVerifyModal, setShowWaVerifyModal] = useState(false);

  // ─── WA Blast state ───
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [blastStep, setBlastStep] = useState<'compose' | 'review' | 'sending' | 'done'>('compose');
  const [blastTemplate, setBlastTemplate] = useState(
    'Assalamualaikum {nama},\n\nDengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara kami.\n\nUntuk info lebih lanjut, silakan kunjungi:\n{link}\n\nTerima kasih atas kehadirannya. 🙏'
  );
  const [blastSendAll, setBlastSendAll] = useState(true); // true = all unsent, false = all guests
  const [blastProgress, setBlastProgress] = useState({ current: 0, total: 0, sent: [] as string[], failed: [] as string[] });
  const [blastRunning, setBlastRunning] = useState(false);
  const blastAbortRef = useRef(false);

  const isAdmin = user?.role === 'ADMIN';
  const isPremium = user?.subscriptionType === 'PREMIUM' || user?.subscriptionType === 'FAST_SERVE' || isAdmin;

  // ─── Admin: User search with debounce (autocomplete/combobox) ───
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserLabel, setSelectedUserLabel] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce user search input
  const handleUserSearchChange = useCallback((value: string) => {
    setAdminUserSearch(value);
    setIsUserDropdownOpen(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedUserSearch(value);
    }, 400);
  }, []);

  // Select a user from autocomplete dropdown
  const handleSelectUser = useCallback((userId: string, label: string) => {
    setSelectedUserId(userId);
    setSelectedUserLabel(label);
    setAdminUserSearch('');
    setDebouncedUserSearch('');
    setIsUserDropdownOpen(false);
  }, []);

  // Clear selected user
  const handleClearUser = useCallback(() => {
    setSelectedUserId('');
    setSelectedUserLabel('');
    setAdminUserSearch('');
    setDebouncedUserSearch('');
    setSelectedInvitationId('');
    setIsUserDropdownOpen(false);
  }, []);

  // Fetch users for admin (debounced search)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-search', debouncedUserSearch],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { search: debouncedUserSearch } });
      return (data as any)?.data || data;
    },
    enabled: isAdmin === true,
  });
  const usersList = usersData?.data || [];

  // Fetch invitations — for admin when a user is selected, use admin endpoint; for regular user, use own
  const { data: ownInvitationsData } = useInvitations({ limit: 100 });
  const { data: adminInvitationsData } = useQuery({
    queryKey: ['admin-invitations-by-user', selectedUserId],
    queryFn: async () => {
      const { data } = await api.get(`/invitations/admin/by-user/${selectedUserId}`, { params: { limit: 100 } });
      return (data as any)?.data || data;
    },
    enabled: isAdmin === true && !!selectedUserId,
  });

  // Decide which invitations to show
  const invitations = isAdmin && selectedUserId
    ? (adminInvitationsData?.data || [])
    : (ownInvitationsData?.data || []);
  const invitationOptions = invitations.map((inv: any) => ({ value: inv.id, label: inv.title }));

  // Reset invitation selection when user changes
  useEffect(() => {
    setSelectedInvitationId('');
  }, [selectedUserId]);

  // Auto-select invitation from URL param (from invitations page navigation)
  useEffect(() => {
    const invId = searchParams.get('invitationId');
    if (invId && invitations.length > 0) {
      const exists = invitations.some((inv: any) => inv.id === invId);
      if (exists) {
        setSelectedInvitationId(invId);
      }
    }
  }, [searchParams, invitations]);

  const { data: guestsData, isLoading } = useGuests(
    selectedInvitationId,
    selectedInvitationId ? { search } : undefined,
  );
  const guests = guestsData?.data || [];

  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const importGuests = useImportGuests();
  const importGuestsExcel = useImportGuestsExcel();
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

  const handleImportExcel = async () => {
    if (!importFile) {
      addToast('Pilih file Excel terlebih dahulu', 'error');
      return;
    }
    try {
      await importGuestsExcel.mutateAsync({
        invitationId: selectedInvitationId,
        file: importFile,
      });
      addToast('Tamu berhasil diimpor dari Excel', 'success');
      setIsImportModalOpen(false);
      setImportFile(null);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal mengimpor tamu dari Excel', 'error');
    }
  };

  const handleExportExcel = async () => {
    if (!isPremium) {
      setPremiumModal({ open: true, feature: 'Export Excel' });
      return;
    }
    if (!selectedInvitationId) {
      addToast('Pilih undangan terlebih dahulu', 'error');
      return;
    }
    setExportLoading(true);
    try {
      const response = await api.get('/invitations/export/excel', {
        responseType: 'blob',
        params: { baseUrl: window.location.origin, invitationId: selectedInvitationId },
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap-undangan-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast('File Excel berhasil diunduh!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal mengunduh file Excel', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadGuestPdf = (guest: any) => {
    if (!isPremium) {
      setPremiumModal({ open: true, feature: 'Download PDF per Tamu' });
      return;
    }
    const invitation = invitations.find((inv: any) => inv.id === selectedInvitationId);
    if (!invitation) return;
    const templateSlug = invitation.templates?.[0]?.template?.slug || 'default';
    // Pass autoOpen=1 to skip the cover screen and show full content, plus print=1 to auto-trigger print
    const url = `${window.location.origin}/${invitation.slug}/${templateSlug}?kpd=${encodeURIComponent(guest.name)}&autoOpen=1&print=1`;
    window.open(url, '_blank');
    addToast('Halaman undangan dibuka untuk dicetak/simpan PDF', 'info');
  };

  const handleDownloadExcelTemplate = () => {
    // Create a simple Excel-compatible CSV template for download
    const header = 'Nama,Telepon/HP,Email,Alamat';
    const example1 = 'Budi Santoso,081234567890,budi@email.com,Jakarta';
    const example2 = 'Sari Wulandari,082345678901,sari@email.com,Bandung';
    const csvContent = `${header}\n${example1}\n${example2}`;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-tamu.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Template import berhasil diunduh', 'success');
  };

  const handleCopyLink = (guest: any) => {
    const invitation = invitations.find((inv: any) => inv.id === selectedInvitationId);
    if (!invitation) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const templateSlug = invitation.templates?.[0]?.template?.slug || 'default';
    const url = `${baseUrl}/${invitation.slug}/${templateSlug}?kpd=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(url);
    addToast('Link undangan disalin!', 'success');
  };

  // ─── WA Blast helpers ───
  const getInvitationLink = (guestName: string) => {
    const invitation = invitations.find((inv: any) => inv.id === selectedInvitationId);
    if (!invitation) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const templateSlug = invitation.templates?.[0]?.template?.slug || 'default';
    return `${baseUrl}/${invitation.slug}/${templateSlug}?kpd=${encodeURIComponent(guestName)}`;
  };

  const resolveTemplate = (template: string, guest: any) => {
    const link = getInvitationLink(guest.name);
    return template
      .replace(/\{nama\}/gi, guest.name || '')
      .replace(/\{telepon\}/gi, guest.phone || '')
      .replace(/\{email\}/gi, guest.email || '')
      .replace(/\{alamat\}/gi, guest.address || '')
      .replace(/\{link\}/gi, link);
  };

  const formatPhoneForWA = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    // Convert 08xx to 628xx for Indonesian numbers
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    // If no country code, assume Indonesia
    if (!cleaned.startsWith('62') && cleaned.length <= 12) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const blastTargetGuests = (blastSendAll
    ? guests.filter((g: any) => !g.sentAt && g.phone)
    : guests.filter((g: any) => g.phone)
  );

  const handleOpenBlastModal = () => {
    setBlastStep('compose');
    setBlastProgress({ current: 0, total: 0, sent: [], failed: [] });
    setBlastRunning(false);
    blastAbortRef.current = false;
    setIsBlastModalOpen(true);
  };

  const handleStartBlast = async () => {
    const targets = blastTargetGuests;
    if (targets.length === 0) return;

    setBlastStep('sending');
    setBlastRunning(true);
    blastAbortRef.current = false;
    setBlastProgress({ current: 0, total: targets.length, sent: [], failed: [] });

    const sentIds: string[] = [];
    const failedNames: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      if (blastAbortRef.current) break;

      const guest = targets[i];
      const waPhone = formatPhoneForWA(guest.phone || '');
      const message = resolveTemplate(blastTemplate, guest);

      try {
        // Open WhatsApp with pre-filled message
        const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        sentIds.push(guest.id);

        setBlastProgress((prev) => ({
          ...prev,
          current: i + 1,
          sent: [...prev.sent, guest.name],
        }));
      } catch {
        failedNames.push(guest.name);
        setBlastProgress((prev) => ({
          ...prev,
          current: i + 1,
          failed: [...prev.failed, guest.name],
        }));
      }

      // Delay between each message (3 seconds) to avoid rate limiting and give user time to click send
      if (i < targets.length - 1 && !blastAbortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Mark sent guests in backend
    if (sentIds.length > 0) {
      try {
        await api.patch('/guests/batch/sent', { ids: sentIds, sentVia: 'WHATSAPP' });
      } catch {}
    }

    setBlastRunning(false);
    setBlastStep('done');

    // Refresh guest list
    // Using TanStack Query invalidation approach
    if (sentIds.length > 0) {
      addToast(`Blast WA selesai! ${sentIds.length} pesan dibuka.`, 'success');
    }
  };

  const handleStopBlast = () => {
    blastAbortRef.current = true;
    setBlastRunning(false);
  };

  const totalGuests = guests.length;
  const sentCount = guests.filter((g: any) => g.sentAt).length;
  const notSentCount = totalGuests - sentCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Tamu</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Kelola tamu undangan semua pengguna' : 'Kelola tamu undangan Anda'}
          </p>
        </div>
      </div>

      {/* Admin: User Search Autocomplete */}
      {isAdmin && (
        <Card className="border-violet-200 bg-violet-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-800">Mode Admin — Lihat Tamu User Lain</span>
            </div>

            {/* Autocomplete / Combobox */}
            <div ref={userSearchRef} className="relative">
              {selectedUserId ? (
                /* ── Selected user chip ── */
                <div className="flex items-center justify-between h-10 w-full rounded-md border border-violet-300 bg-white px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <span className="text-sm text-gray-800 truncate">{selectedUserLabel}</span>
                  </div>
                  <button
                    onClick={handleClearUser}
                    className="ml-2 p-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* ── Search input ── */
                <>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Cari user berdasarkan nama atau email..."
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
                    value={adminUserSearch}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    onFocus={() => { if (adminUserSearch.trim()) setIsUserDropdownOpen(true); }}
                  />
                  {usersLoading && debouncedUserSearch && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </>
              )}

              {/* ── Dropdown results ── */}
              {isUserDropdownOpen && !selectedUserId && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  {usersLoading && debouncedUserSearch ? (
                    <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Mencari user...
                    </div>
                  ) : !debouncedUserSearch ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      Ketik nama atau email untuk mencari user...
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      Tidak ada user ditemukan untuk &quot;{debouncedUserSearch}&quot;
                    </div>
                  ) : (
                    usersList.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u.id, `${u.fullName} (${u.email})`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{u.fullName}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <Badge variant="default" className="text-[10px] flex-shrink-0">
                          {u.subscriptionType || 'BASIC'}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedUserId && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-violet-600">
                  Menampilkan undangan milik: <strong>{selectedUserLabel}</strong>
                </p>
                <button
                  onClick={handleClearUser}
                  className="text-xs text-violet-600 hover:text-violet-800 underline"
                >
                  Reset ke Undangan Saya
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invitation Selector */}
      <Card>
        <CardContent className="p-4">
          <Select
            label="Pilih Undangan"
            placeholder={
              isAdmin && !selectedUserId && invitations.length > 0
                ? 'Pilih undangan Anda, atau pilih user di atas...'
                : 'Pilih undangan untuk melihat daftar tamu...'
            }
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
              <Button
                variant="outline"
                onClick={() => {
                  if (!isPremium) {
                    setPremiumModal({ open: true, feature: 'Blast WhatsApp' });
                    return;
                  }
                  // Check WhatsApp verification (admin bypasses this check)
                  if (!isAdmin && !user?.isWhatsappVerified) {
                    setShowWaVerifyModal(true);
                    return;
                  }
                  handleOpenBlastModal();
                }}
                disabled={guests.length === 0}
                className="relative border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Blast WA
                {!isPremium && <Crown className="w-3 h-3 ml-1 text-amber-500" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                loading={exportLoading}
                className="relative"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
                {!isPremium && <Crown className="w-3 h-3 ml-1 text-amber-500" />}
              </Button>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Tamu
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
                              <button
                                onClick={() => handleDownloadGuestPdf(guest)}
                                className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded relative"
                                title={isPremium ? 'Download PDF' : 'Download PDF (Premium)'}
                              >
                                <FileDown className="w-4 h-4" />
                                {!isPremium && <Crown className="w-2.5 h-2.5 text-amber-500 absolute -top-0.5 -right-0.5" />}
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveGuest} loading={createGuest.isPending || updateGuest.isPending}>
              {editingGuest ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal — Available for ALL users */}
      <Modal open={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportFile(null); setCsvText(''); }} title="Import Tamu">
        <div className="space-y-5">
          {/* Download Template */}
          <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-gray-900">📄 Download Template Import</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Download contoh template yang bisa langsung Anda isi dengan data tamu.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadExcelTemplate}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download
              </Button>
            </div>
          </div>

          {/* Excel Import */}
          <div className="p-4 rounded-xl border-2 border-primary-200 bg-primary-50/50">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-sm">Import dari Excel / CSV File</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Upload file Excel (.xlsx) atau CSV (.csv) dengan kolom: <code className="bg-gray-100 px-1 rounded">Nama, Telepon/HP, Email, Alamat</code>
            </p>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                  {importFile ? (
                    <div className="text-center">
                      <FileSpreadsheet className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700">{importFile.name}</p>
                      <p className="text-xs text-gray-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Klik untuk pilih file Excel atau CSV</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </label>
              {importFile && (
                <button
                  onClick={() => setImportFile(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <Button onClick={handleImportExcel} loading={importGuestsExcel.isPending} disabled={!importFile}>
                <Upload className="w-4 h-4 mr-2" />
                Import File
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau ketik manual</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* CSV Text Import */}
          <div className="p-4 rounded-xl border-2 border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm">Ketik / Paste Data (CSV)</h3>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Format: <code className="bg-gray-100 px-1 rounded">Nama, Telepon, Email, Alamat</code> (satu tamu per baris)
            </p>
            <textarea
              className="w-full h-28 border border-gray-300 rounded-lg p-3 text-sm font-mono resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Budi Santoso, 081234567890, budi@email.com, Jakarta\nSari Wulandari, 082345678901, , Bandung`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button variant="outline" onClick={handleImport} loading={importGuests.isPending} disabled={!csvText.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                Import {csvText.trim().split('\n').filter(Boolean).length} Tamu
              </Button>
            </div>
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

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        open={premiumModal.open}
        onClose={() => setPremiumModal({ open: false, feature: '' })}
        featureName={premiumModal.feature}
      />

      {/* ═══ WhatsApp Verification Required Modal ═══ */}
      {showWaVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowWaVerifyModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Verifikasi WhatsApp Diperlukan
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Untuk menggunakan fitur <strong>Blast WhatsApp</strong>, nomor WhatsApp Anda perlu diverifikasi terlebih dahulu melalui halaman Profil.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Mengapa perlu verifikasi?</h4>
              <ul className="text-xs text-amber-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>Memastikan nomor telepon Anda aktif dan benar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>Mencegah penyalahgunaan fitur blast ke nomor yang salah</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>Proses cepat — hanya butuh 1 menit</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWaVerifyModal(false)}
                className="flex-1"
              >
                Nanti Saja
              </Button>
              <Button
                onClick={() => {
                  setShowWaVerifyModal(false);
                  router.push('/dashboard/profile');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Verifikasi Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ WA Blast Modal ═══ */}
      <Modal
        open={isBlastModalOpen}
        onClose={() => { if (!blastRunning) { setIsBlastModalOpen(false); } }}
        title="Blast WhatsApp"
        className="max-w-lg"
      >
        {/* ── Step 1: Compose ── */}
        {blastStep === 'compose' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Kirim pesan undangan via WhatsApp</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Pesan akan dibuka di WhatsApp untuk setiap tamu secara otomatis. Anda perlu klik &quot;Kirim&quot; di WhatsApp untuk setiap pesan.
                </p>
              </div>
            </div>

            {/* Template variables info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Variabel yang tersedia:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: '{nama}', desc: 'Nama tamu' },
                  { key: '{link}', desc: 'Link undangan' },
                  { key: '{telepon}', desc: 'No. telepon' },
                  { key: '{email}', desc: 'Email' },
                  { key: '{alamat}', desc: 'Alamat' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setBlastTemplate((t) => t + v.key)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors cursor-pointer"
                    title={`Klik untuk menambahkan ${v.key}`}
                  >
                    <code className="font-mono text-[10px]">{v.key}</code>
                    <span className="text-gray-400">— {v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Template Pesan</label>
              <textarea
                className="w-full h-40 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={blastTemplate}
                onChange={(e) => setBlastTemplate(e.target.value)}
                placeholder="Tulis template pesan WhatsApp..."
              />
            </div>

            {/* Target options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Kirim ke:</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={blastSendAll}
                    onChange={() => setBlastSendAll(true)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Belum terkirim saja ({guests.filter((g: any) => !g.sentAt && g.phone).length} tamu)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!blastSendAll}
                    onChange={() => setBlastSendAll(false)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Semua tamu ({guests.filter((g: any) => g.phone).length} tamu)
                  </span>
                </label>
              </div>
            </div>

            {/* Warning for guests without phone */}
            {guests.filter((g: any) => !g.phone).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  {guests.filter((g: any) => !g.phone).length} tamu tidak memiliki nomor telepon dan akan dilewati.
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {blastTargetGuests.length} pesan akan dikirim
                </span>
              </div>
              <span className="text-xs text-green-600">
                ~{Math.ceil(blastTargetGuests.length * 3 / 60)} menit
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsBlastModalOpen(false)}>Batal</Button>
              <Button
                onClick={() => setBlastStep('review')}
                disabled={blastTargetGuests.length === 0 || !blastTemplate.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Pesan
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {blastStep === 'review' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">Preview pesan untuk {blastTargetGuests.length} tamu</p>
              <p className="text-xs text-blue-600 mt-0.5">Cek pesan sebelum mengirim. Scroll untuk melihat semua preview.</p>
            </div>

            {/* Preview list */}
            <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
              {blastTargetGuests.map((guest: any, i: number) => (
                <div key={guest.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{guest.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatPhoneForWA(guest.phone || '')}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                    <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {resolveTemplate(blastTemplate, guest)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setBlastStep('compose')}>
                Kembali
              </Button>
              <Button
                onClick={handleStartBlast}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Mulai Blast ({blastTargetGuests.length} pesan)
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Sending ── */}
        {blastStep === 'sending' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-green-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mengirim Pesan...</h3>
              <p className="text-sm text-gray-500 mt-1">
                Jangan tutup tab ini. Klik &quot;Kirim&quot; di setiap tab WhatsApp yang terbuka.
              </p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{blastProgress.current} / {blastProgress.total}</span>
                <span>{Math.round((blastProgress.current / Math.max(blastProgress.total, 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(blastProgress.current / Math.max(blastProgress.total, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Recent activity */}
            <div className="max-h-36 overflow-y-auto space-y-1">
              {blastProgress.sent.slice(-5).reverse().map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>WhatsApp dibuka untuk: {name}</span>
                </div>
              ))}
              {blastProgress.failed.slice(-3).reverse().map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-red-500">
                  <X className="w-3 h-3" />
                  <span>Gagal: {name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleStopBlast}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Hentikan
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {blastStep === 'done' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Blast Selesai!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Pastikan Anda sudah mengirim semua pesan di tab WhatsApp yang terbuka.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{blastProgress.sent.length}</p>
                <p className="text-xs text-green-600">Berhasil Dibuka</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{blastProgress.failed.length}</p>
                <p className="text-xs text-red-500">Gagal</p>
              </div>
            </div>

            {/* Failed details */}
            {blastProgress.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-red-700 mb-1">Detail gagal kirim:</p>
                {blastProgress.failed.map((name, i) => (
                  <p key={i} className="text-xs text-red-600">• {name} — Gagal membuka tab WhatsApp (popup mungkin diblokir browser)</p>
                ))}
              </div>
            )}

            {blastAbortRef.current && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Blast dihentikan sebelum selesai. {blastProgress.total - blastProgress.current} pesan tidak dikirim.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Download blast report as Excel
                  const header = 'No,Nama Tamu,No HP,Status,Keterangan\n';
                  const allTargets = blastSendAll
                    ? guests.filter((g: any) => !g.sentAt && g.phone)
                    : guests.filter((g: any) => g.phone);
                  const rows = allTargets.map((g: any, i: number) => {
                    const isSent = blastProgress.sent.includes(g.name);
                    const isFailed = blastProgress.failed.includes(g.name);
                    const status = isSent ? 'Berhasil' : isFailed ? 'Gagal' : 'Tidak Dikirim';
                    const reason = isFailed ? 'Popup diblokir browser atau error' : isSent ? '-' : 'Blast dihentikan sebelum giliran';
                    return `${i + 1},"${g.name}","${g.phone || ''}",${status},"${reason}"`;
                  }).join('\n');
                  const csv = '\ufeff' + header + rows;
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `report-blast-wa-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  addToast('Report blast berhasil diunduh', 'success');
                }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button
                onClick={() => { setIsBlastModalOpen(false); window.location.reload(); }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
