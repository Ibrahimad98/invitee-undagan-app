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
  UserX,
  Mail,
  Phone,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface EditUserForm {
  fullName: string;
  phone: string;
  role: string;
}

export default function UsersManagementPage() {
  const { user: currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    fullName: '',
    phone: '',
    role: 'USER',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
      addToast('Anda tidak memiliki akses ke halaman ini', 'error');
    }
  }, [currentUser, router, addToast]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/users');
      const usersList = data?.data?.data || data?.data || data || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error: any) {
      addToast('Gagal memuat data pengguna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentUser]);

  const handleOpenEditModal = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    if (!editForm.fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'error');
      return;
    }

    setEditLoading(true);
    try {
      await api.patch(`/users/${editingUser.id}`, editForm);
      addToast('Data pengguna berhasil diperbarui', 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal memperbarui pengguna', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

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

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const userCount = users.filter((u) => u.role === 'USER').length;

  if (currentUser?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-500 mt-1">Atur semua pengguna yang terdaftar di platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total Pengguna</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-xs text-gray-500">User Biasa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari pengguna..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500 font-medium">
                {search ? 'Tidak ada pengguna ditemukan' : 'Belum ada pengguna'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Pengguna
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Telepon
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Terdaftar
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
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
                      <td className="px-4 py-3 text-sm text-gray-600">{u.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {u.role === 'ADMIN' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            'User'
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => setDeleteUserId(u.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
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

      {/* Edit User Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Pengguna — ${editingUser?.fullName}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-700">{editingUser?.email}</p>
            </div>
          </div>
          <Input
            label="Nama Lengkap"
            value={editForm.fullName}
            onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Nomor Telepon"
            placeholder="08123456789"
            value={editForm.phone}
            onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Select
            label="Role"
            options={[
              { value: 'USER', label: 'User Biasa' },
              { value: 'ADMIN', label: 'Administrator' },
            ]}
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
          />
          {editingUser?.id === currentUser?.id && editForm.role !== 'ADMIN' && (
            <p className="text-sm text-red-500">
              ⚠️ Anda tidak bisa menurunkan role akun sendiri
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveUser}
              loading={editLoading}
              disabled={editingUser?.id === currentUser?.id && editForm.role !== 'ADMIN'}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
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
