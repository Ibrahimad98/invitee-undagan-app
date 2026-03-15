'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Lock, Save, Mail, Phone, ShieldCheck, KeyRound, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type TabId = 'profile' | 'password';

const PASSWORD_STEPS = [
  { label: 'Konfirmasi', icon: ShieldCheck },
  { label: 'Verifikasi', icon: KeyRound },
  { label: 'Password Baru', icon: CheckCircle2 },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [passwordStep, setPasswordStep] = useState(1);

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
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: (user as any).phone || '',
      });
    }
  }, [user]);

  // Reset password wizard when switching tabs
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'password') {
      setPasswordStep(1);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

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

  const handleVerifyCurrentPassword = async () => {
    if (!passwordForm.currentPassword) {
      addToast('Password saat ini wajib diisi', 'error');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    try {
      await api.post('/auth/verify-password', {
        currentPassword: passwordForm.currentPassword,
      });
      addToast('Password terverifikasi ✓', 'success');
      setPasswordStep(3);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Password tidak benar';
      setVerifyError(msg);
      addToast(msg, 'error');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChangePassword = async () => {
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
      addToast('Password berhasil diubah! 🎉', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStep(1);
      setActiveTab('profile');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengubah password';
      addToast(msg, 'error');
      // If current password is wrong, go back to step 2
      if (msg.toLowerCase().includes('password saat ini')) {
        setPasswordStep(2);
        setPasswordForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabId, label: 'Informasi Profil', icon: User },
    { id: 'password' as TabId, label: 'Ubah Password', icon: Lock },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar name={user?.fullName || 'U'} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              </div>
            </div>
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
      )}

      {/* Password Tab — 3-Step Wizard */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center">
            {PASSWORD_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const stepNum = index + 1;
              const isActive = passwordStep === stepNum;
              const isCompleted = passwordStep > stepNum;

              return (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                        isCompleted
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : isActive
                            ? 'bg-primary-50 border-primary-600 text-primary-600'
                            : 'bg-gray-100 border-gray-300 text-gray-400',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-1.5 text-xs font-medium whitespace-nowrap',
                        isActive || isCompleted ? 'text-primary-700' : 'text-gray-400',
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < PASSWORD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-12 sm:w-20 mx-2 mb-6 transition-colors duration-300',
                        isCompleted ? 'bg-primary-600' : 'bg-gray-200',
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Confirmation */}
          {passwordStep === 1 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ubah Password</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Apakah Anda yakin ingin mengubah password akun Anda?
                      Pastikan Anda mengingat password saat ini sebelum melanjutkan.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Button variant="outline" onClick={() => handleTabChange('profile')}>
                      Batal
                    </Button>
                    <Button onClick={() => setPasswordStep(2)}>
                      Ya, Lanjutkan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Verify Current Password */}
          {passwordStep === 2 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center mb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <KeyRound className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Verifikasi Identitas</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Masukkan password Anda saat ini untuk melanjutkan
                  </p>
                </div>
                <Input
                  label="Password Saat Ini"
                  type="password"
                  placeholder="Masukkan password saat ini"
                  value={passwordForm.currentPassword}
                  onChange={(e) => { setPasswordForm((f) => ({ ...f, currentPassword: e.target.value })); setVerifyError(''); }}
                  autoFocus
                />
                {verifyError && (
                  <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600">
                    <Lock className="w-3.5 h-3.5" />
                    {verifyError}
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => { setPasswordStep(1); setPasswordForm((f) => ({ ...f, currentPassword: '' })); setVerifyError(''); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                  <Button onClick={handleVerifyCurrentPassword} loading={verifyLoading}>
                    Verifikasi & Lanjutkan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: New Password */}
          {passwordStep === 3 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center mb-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Buat Password Baru</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Masukkan password baru Anda (minimal 6 karakter)
                  </p>
                </div>
                <Input
                  label="Password Baru"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  autoFocus
                />
                <Input
                  label="Konfirmasi Password Baru"
                  type="password"
                  placeholder="Ulangi password baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                />
                {passwordForm.newPassword && passwordForm.confirmPassword && (
                  <div className={cn(
                    'flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg',
                    passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600',
                  )}>
                    {passwordForm.newPassword === passwordForm.confirmPassword ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Password cocok</>
                    ) : (
                      <><Lock className="w-3.5 h-3.5" /> Password tidak cocok</>
                    )}
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => { setPasswordStep(2); setPasswordForm((f) => ({ ...f, newPassword: '', confirmPassword: '' })); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                  <Button onClick={handleChangePassword} loading={passwordLoading}>
                    <Lock className="w-4 h-4 mr-2" />
                    Ubah Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
