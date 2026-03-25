'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Users,
  Search,
  Edit2,
  Trash2,
  Plus,
  UserCheck,
  Mail,
  Crown,
  Zap,
  Star,
  Calendar,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { SubscriptionBadge } from '@/components/ui/subscription-badge';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  subscriptionType: 'BASIC' | 'PREMIUM' | 'FAST_SERVE';
  subscriptionExpireDate?: string | null;
  maxGuests: number;
  createdAt: string;
}

interface GuestLimitRequest {
  id: string;
  userId: string;
  invitationId?: string;
  currentLimit: number;
  requestedAmount: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string; subscriptionType: string; maxGuests: number };
}

interface EditUserForm {
  fullName: string;
  phone: string;
  role: string;
  subscriptionType: string;
  subscriptionExpireDate: string;
  maxGuests: number;
}

export default function UsersManagementPage() {
  const { user: currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<GuestLimitRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isBetaActive, setIsBetaActive] = useState(false);

  // Edit user modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    fullName: '',
    phone: '',
    role: 'USER',
    subscriptionType: 'BASIC',
    subscriptionExpireDate: '',
    maxGuests: 300,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Fast Serve modal
  const [isFastServeModalOpen, setIsFastServeModalOpen] = useState(false);
  const [fastServeForm, setFastServeForm] = useState({ fullName: '', phone: '', email: '' });
  const [fastServeLoading, setFastServeLoading] = useState(false);
  const [fastServeResult, setFastServeResult] = useState<{ email: string; generatedPassword: string } | null>(null);

  // Delete modal
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Redirect non-admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
      addToast('Anda tidak memiliki akses ke halaman ini', 'error');
    }
  }, [currentUser, router, addToast]);

  // Fetch beta config
  useEffect(() => {
    api.get('/auth/beta-config').then(({ data }) => {
      const config = data?.data || data;
      setIsBetaActive(config.isBeta === true);
    }).catch(() => {});
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/users');
      const usersList = data?.data?.data || data?.data || data || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch {
      addToast('Gagal memuat data pengguna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/users/guest-limit-requests');
      const list = data?.data?.data || data?.data || data || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      addToast('Gagal memuat permintaan', 'error');
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchUsers();
      fetchRequests();
    }
  }, [currentUser]);

  // ── Edit User ──
  const handleOpenEditModal = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      subscriptionType: user.subscriptionType || 'BASIC',
      subscriptionExpireDate: user.subscriptionExpireDate
        ? new Date(user.subscriptionExpireDate).toISOString().split('T')[0]
        : '',
      maxGuests: user.maxGuests ?? 100,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser || !editForm.fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'error');
      return;
    }
    setEditLoading(true);
    try {
      const payload: any = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        role: editForm.role,
        subscriptionType: editForm.subscriptionType,
        maxGuests: editForm.maxGuests,
      };
      if (editForm.subscriptionType === 'PREMIUM' && editForm.subscriptionExpireDate) {
        payload.subscriptionExpireDate = editForm.subscriptionExpireDate;
      }
      await api.patch(`/users/${editingUser.id}`, payload);
      addToast('Data pengguna berhasil diperbarui', 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal memperbarui pengguna', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Fast Serve ──
  const handleCreateFastServe = async () => {
    if (!fastServeForm.fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'error');
      return;
    }
    setFastServeLoading(true);
    try {
      const { data } = await api.post('/users/fast-serve', fastServeForm);
      const result = data?.data || data;
      setFastServeResult({ email: result.email, generatedPassword: result.generatedPassword });
      addToast('User Enterprise berhasil dibuat', 'success');
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal membuat user', 'error');
    } finally {
      setFastServeLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!fastServeResult) return;
    const text = `Email: ${fastServeResult.email}\nPassword: ${fastServeResult.generatedPassword}`;
    navigator.clipboard.writeText(text);
    addToast('Kredensial disalin ke clipboard', 'success');
  };

  // ── Delete User ──
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/users/${deleteUserId}`);
      addToast('Pengguna berhasil dihapus', 'success');
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setDeleteUserId(null);
    }
  };

  // ── Guest Limit Requests ──
  const handleApproveRequest = async (id: string) => {
    try {
      await api.patch(`/users/guest-limit-requests/${id}/approve`, {});
      addToast('Permintaan disetujui', 'success');
      fetchRequests();
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal menyetujui', 'error');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await api.patch(`/users/guest-limit-requests/${id}/reject`, {});
      addToast('Permintaan ditolak', 'success');
      fetchRequests();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal menolak', 'error');
    }
  };

  // ── Computed ──
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const premiumCount = users.filter((u) => u.subscriptionType === 'PREMIUM').length;
  const fastServeCount = users.filter((u) => u.subscriptionType === 'FAST_SERVE').length;
  const pendingRequestCount = requests.filter((r) => r.status === 'PENDING').length;

  if (currentUser?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
          <p className="text-gray-500 mt-1">Atur semua pengguna yang terdaftar di platform</p>
        </div>
        <Button onClick={() => { setFastServeForm({ fullName: '', phone: '', email: '' }); setFastServeResult(null); setIsFastServeModalOpen(true); }}>
          <Zap className="w-4 h-4 mr-2" />
          Buat User Enterprise
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{totalUsers}</p><p className="text-xs text-gray-500">Total</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Shield className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{adminCount}</p><p className="text-xs text-gray-500">Admin</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg"><Crown className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{premiumCount}</p><p className="text-xs text-gray-500">Premium</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><Zap className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold">{fastServeCount}</p><p className="text-xs text-gray-500">Enterprise</p></div>
          </CardContent>
        </Card>
        {isBetaActive && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-2xl font-bold">{pendingRequestCount}</p><p className="text-xs text-gray-500">Permintaan</p></div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      {isBetaActive && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Pengguna
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'requests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1.5" />
            Request Premium
            {pendingRequestCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingRequestCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ═══ Tab: Users ═══ */}
      {activeTab === 'users' && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Cari pengguna..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="mt-4 text-gray-500 font-medium">{search ? 'Tidak ditemukan' : 'Belum ada pengguna'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipe</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kuota Tamu</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Terdaftar</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.fullName} size="sm" />
                              <span className="font-medium text-sm">{u.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {u.role === 'ADMIN' ? <><Shield className="w-3 h-3 mr-1" />Admin</> : 'User'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <SubscriptionBadge type={u.subscriptionType || 'BASIC'} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.maxGuests ?? 100}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleOpenEditModal(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {u.id !== currentUser?.id && (
                                <button onClick={() => setDeleteUserId(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
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

      {/* ═══ Tab: Guest Limit Requests ═══ */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500 font-medium">Tidak ada permintaan</p>
                <p className="text-sm text-gray-400 mt-1">Semua permintaan akses Premium sudah diproses</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{req.user.fullName}</span>
                        <span className="text-xs text-gray-400">{req.user.email}</span>
                        <SubscriptionBadge type={req.user.subscriptionType} size="sm" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Meminta <strong>akses fitur Premium</strong> (kuota saat ini: {req.currentLimit} tamu → Premium: 2000 tamu)
                      </p>
                      {req.reason && (
                        <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-2">
                          <strong>Alasan:</strong> {req.reason}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'PENDING' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Tolak
                          </Button>
                          <Button size="sm" onClick={() => handleApproveRequest(req.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Setujui
                          </Button>
                        </>
                      ) : (
                        <Badge variant={req.status === 'APPROVED' ? 'default' : 'secondary'}>
                          {req.status === 'APPROVED' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Ditolak</>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ═══ Edit User Modal ═══ */}
      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit — ${editingUser?.fullName}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-700">{editingUser?.email}</p>
            </div>
          </div>
          <Input label="Nama Lengkap" value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
          <Input label="Nomor Telepon" placeholder="08123456789" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          <Select
            label="Role"
            options={[{ value: 'USER', label: 'User Biasa' }, { value: 'ADMIN', label: 'Administrator' }]}
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
          />
          {editingUser?.id === currentUser?.id && editForm.role !== 'ADMIN' && (
            <p className="text-sm text-red-500">⚠️ Anda tidak bisa menurunkan role akun sendiri</p>
          )}

          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Pengaturan Subscription
            </p>
            <div className="space-y-3">
              <Select
                label="Tipe Subscription"
                options={[
                  { value: 'BASIC', label: 'Basic' },
                  { value: 'PREMIUM', label: 'Premium' },
                  { value: 'FAST_SERVE', label: 'Enterprise' },
                ]}
                value={editForm.subscriptionType}
                onChange={(e) => setEditForm((f) => ({ ...f, subscriptionType: e.target.value }))}
              />
              {editForm.subscriptionType === 'PREMIUM' && (
                <Input
                  label="Tanggal Berakhir Subscription"
                  type="date"
                  value={editForm.subscriptionExpireDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, subscriptionExpireDate: e.target.value }))}
                />
              )}
              <Input
                label="Kuota Tamu Maksimal"
                type="number"
                min={0}
                max={10000}
                value={editForm.maxGuests}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setEditForm((f) => ({ ...f, maxGuests: Math.min(val, 10000) }));
                }}
              />
              <p className="text-xs text-gray-400">
                Basic: 300 tamu, Premium: 2000 tamu. Maksimal: 10.000 tamu.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveUser} loading={editLoading} disabled={editingUser?.id === currentUser?.id && editForm.role !== 'ADMIN'}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══ Fast Serve Modal ═══ */}
      <Modal
        open={isFastServeModalOpen}
        onClose={() => { setIsFastServeModalOpen(false); setFastServeResult(null); }}
        title="Buat User Enterprise"
      >
        {fastServeResult ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">User Berhasil Dibuat!</h3>
              <p className="text-sm text-gray-500 mt-1">Bagikan kredensial berikut kepada user:</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{fastServeResult.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Password:</span>
                <span className="font-medium">{fastServeResult.generatedPassword}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Password ini hanya ditampilkan sekali. Pastikan untuk menyalin dan membagikannya sekarang.</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyCredentials} className="flex-1">
                <Copy className="w-4 h-4 mr-2" /> Salin Kredensial
              </Button>
              <Button onClick={() => { setIsFastServeModalOpen(false); setFastServeResult(null); }} className="flex-1">
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Buat akun user bertipe <strong className="text-emerald-600">Enterprise</strong> dengan password otomatis.
              Admin akan memberikan kredensial login kepada user.
            </p>
            <Input
              label="Nama Lengkap"
              placeholder="Nama user"
              value={fastServeForm.fullName}
              onChange={(e) => setFastServeForm((f) => ({ ...f, fullName: e.target.value }))}
            />
            <Input
              label="Email (opsional)"
              placeholder="Kosongkan untuk auto-generate"
              value={fastServeForm.email}
              onChange={(e) => setFastServeForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Input
              label="Telepon (opsional)"
              placeholder="08123456789"
              value={fastServeForm.phone}
              onChange={(e) => setFastServeForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFastServeModalOpen(false)}>Batal</Button>
              <Button onClick={handleCreateFastServe} loading={fastServeLoading}>
                <Zap className="w-4 h-4 mr-2" /> Buat User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ Delete Confirmation ═══ */}
      <ConfirmModal
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmLabel="Hapus"
      />
    </div>
  );
}
