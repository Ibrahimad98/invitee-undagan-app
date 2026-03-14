'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: (user as any).phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!profileForm.fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const { data } = await api.patch('/users/me', profileForm);
      const updatedUser = data.data || data;
      setUser(updatedUser);
      addToast('Profil berhasil diperbarui', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      addToast('Password saat ini wajib diisi', 'error');
      return;
    }
    if (!passwordForm.newPassword) {
      addToast('Password baru wajib diisi', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('Password baru minimal 6 karakter', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Konfirmasi password tidak cocok', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      addToast('Password berhasil diubah', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal mengubah password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-gray-500 mt-1">Kelola profil dan keamanan akun Anda</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50"
          />
          <Input
            label="Nama Lengkap"
            placeholder="Nama lengkap Anda"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Input
            label="Nomor Telepon"
            placeholder="08123456789"
            value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleUpdateProfile} loading={profileLoading}>
              <Save className="w-4 h-4 mr-2" />
              Simpan Profil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Ubah Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            placeholder="Masukkan password saat ini"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            label="Password Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleChangePassword} loading={passwordLoading}>
              <Lock className="w-4 h-4 mr-2" />
              Ubah Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
