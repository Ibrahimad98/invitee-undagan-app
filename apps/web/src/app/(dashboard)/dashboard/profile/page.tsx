'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  User, Lock, Save, Mail, Phone, ShieldCheck, KeyRound, CheckCircle2,
  ArrowLeft, ArrowRight, Pencil, X, MapPin, Calendar, Crown, Star,
  CreditCard, Sparkles, Clock, BadgeCheck, ExternalLink, Camera, Loader2,
} from 'lucide-react';
import { SubscriptionBadge } from '@/components/ui/subscription-badge';

type TabId = 'profile' | 'password' | 'plan';

const PASSWORD_STEPS = [
  { label: 'Konfirmasi', icon: ShieldCheck },
  { label: 'Verifikasi', icon: KeyRound },
  { label: 'Password Baru', icon: CheckCircle2 },
];

function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '-';
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [requestPremiumLoading, setRequestPremiumLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Request access modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'PREMIUM' | 'ENTERPRISE'>('PREMIUM');
  const [requestReason, setRequestReason] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
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
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setIsEditing(false);
    if (tab === 'password') {
      setPasswordStep(1);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const payload: any = {
        fullName: profileForm.fullName,
        phone: profileForm.phone || undefined,
        address: profileForm.address || undefined,
      };
      if (profileForm.dateOfBirth) {
        payload.dateOfBirth = profileForm.dateOfBirth;
      }
      const { data } = await api.patch('/users/me', payload);
      const updatedUser = data.data || data;
      setUser(updatedUser);
      addToast('Profil berhasil diperbarui', 'success');
      setIsEditing(false);
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
      if (msg.toLowerCase().includes('password saat ini')) {
        setPasswordStep(2);
        setPasswordForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar (JPG, PNG, dll)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      // Upload via media endpoint
      const formData = new FormData();
      formData.append('file', file);
      const { data: mediaData } = await api.post('/media/upload?purpose=PROFILE', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const mediaResult = mediaData?.data || mediaData;
      // Save the raw storage key (not the presigned URL) so the backend can resolve it
      const fileKey = mediaResult?.fileKey || mediaResult?.fileUrl || '';

      if (!fileKey) {
        addToast('Gagal mendapatkan URL foto', 'error');
        return;
      }

      // Update user profile with the storage key — backend will resolve to full URL
      const { data } = await api.patch('/users/me', { avatarUrl: fileKey });
      const updatedUser = data.data || data;
      setUser(updatedUser);
      addToast('Foto profil berhasil diperbarui!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal mengupload foto profil', 'error');
    } finally {
      setAvatarUploading(false);
      // Reset file input
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSubmitAccessRequest = async () => {
    if (!requestReason.trim()) {
      addToast('Alasan wajib diisi', 'error');
      return;
    }

    setRequestPremiumLoading(true);
    try {
      await api.post('/users/guest-limit-requests', {
        requestedAmount: requestType === 'PREMIUM' ? 2000 : 5000,
        reason: `[Request ${requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'}] ${requestReason}`,
      });
      addToast(`Permintaan akses ${requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'} telah dikirim ke admin!`, 'success');
      setShowRequestModal(false);
      setRequestReason('');
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('sedang diproses')) {
        addToast('Anda sudah memiliki permintaan yang sedang diproses', 'info');
      } else {
        addToast(error.response?.data?.message || 'Gagal mengirim permintaan', 'error');
      }
    } finally {
      setRequestPremiumLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabId, label: 'Informasi Profil', icon: User },
    { id: 'plan' as TabId, label: 'Paket Saya', icon: CreditCard },
    { id: 'password' as TabId, label: 'Ubah Password', icon: Lock },
  ];

  const subscriptionType = (user as any)?.subscriptionType || 'BASIC';
  const subscriptionExpireDate = (user as any)?.subscriptionExpireDate;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar name={user?.fullName || 'U'} src={user?.avatarUrl} size="lg" />
          {subscriptionType === 'PREMIUM' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
          {/* Upload overlay */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            {avatarUploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
            </span>
            <SubscriptionBadge type={subscriptionType} />
          </div>
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

      {/* Profile Tab — View Mode */}
      {activeTab === 'profile' && !isEditing && (
        <Card>
          <CardContent className="p-6 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Data Profil</h3>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit Profil
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Email */}
              <div className="flex items-start gap-3 py-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex items-start gap-3 py-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Nama Lengkap</p>
                  <p className="text-sm font-medium text-gray-800">{user?.fullName || '-'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 py-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Nomor Telepon</p>
                  <p className="text-sm font-medium text-gray-800">{user?.phone || '-'}</p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start gap-3 py-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Tanggal Lahir</p>
                  <p className="text-sm font-medium text-gray-800">{formatDisplayDate(user?.dateOfBirth)}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 py-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Alamat</p>
                  <p className="text-sm font-medium text-gray-800">{user?.address || '-'}</p>
                </div>
              </div>

              {/* Subscription */}
              <div className="flex items-start gap-3 py-3">
                <Crown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Langganan</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <SubscriptionBadge type={subscriptionType} />
                    {subscriptionType === 'PREMIUM' && subscriptionExpireDate && (
                      <span className="text-xs text-gray-500">
                        hingga {formatDisplayDate(subscriptionExpireDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Tab — Edit Mode */}
      {activeTab === 'profile' && isEditing && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900">Edit Profil</h3>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
            <Input
              label="Tanggal Lahir"
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) => setProfileForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Alamat lengkap Anda"
                rows={3}
                value={profileForm.address}
                onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Batal
              </Button>
              <Button onClick={handleUpdateProfile} loading={profileLoading}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Profil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-gray-900">Status Paket</h3>
                <SubscriptionBadge type={subscriptionType} />
              </div>

              <div className="space-y-4">
                {/* Plan Name */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    subscriptionType === 'PREMIUM'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                      : 'bg-gray-200',
                  )}>
                    {subscriptionType === 'PREMIUM' ? (
                      <Crown className="w-5 h-5 text-white" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Paket {subscriptionType === 'PREMIUM' ? 'Premium' : subscriptionType === 'FAST_SERVE' ? 'Enterprise' : 'Basic'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subscriptionType === 'PREMIUM' || subscriptionType === 'FAST_SERVE'
                        ? 'Akses penuh ke semua fitur'
                        : 'Fitur dasar untuk membuat undangan'}
                    </p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center gap-3 py-3">
                    <BadgeCheck className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium">
                        {subscriptionType === 'PREMIUM' || subscriptionType === 'FAST_SERVE' ? (
                          <span className="text-green-600">● Aktif</span>
                        ) : (
                          <span className="text-gray-600">● Paket Gratis</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Berlaku Hingga</p>
                      <p className="text-sm font-medium text-gray-800">
                        {(subscriptionType === 'PREMIUM' || subscriptionType === 'FAST_SERVE') && subscriptionExpireDate
                          ? formatDisplayDate(subscriptionExpireDate)
                          : (subscriptionType === 'PREMIUM' || subscriptionType === 'FAST_SERVE')
                            ? 'Selamanya'
                            : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-3">
                    <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Fitur</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {subscriptionType === 'PREMIUM' || subscriptionType === 'FAST_SERVE' ? (
                          <>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Semua Template Premium</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Kuota 2000 Tamu</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Export Excel</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Download PDF</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Blast WhatsApp</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Galeri Unlimited</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Prioritas Support</span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">Template Dasar</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">Kuota 300 Tamu</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">Import CSV</span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600">RSVP & Ucapan</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          {subscriptionType !== 'PREMIUM' && subscriptionType !== 'FAST_SERVE' && (
            <Card className="border-dashed border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upgrade Paket Anda</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dapatkan akses ke semua tema, export Excel, download PDF per tamu, dan fitur eksklusif lainnya.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => { setRequestType('PREMIUM'); setRequestReason(''); setShowRequestModal(true); }}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Request Akses Premium
                  </Button>
                  <Button
                    onClick={() => { setRequestType('ENTERPRISE'); setRequestReason(''); setShowRequestModal(true); }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Request Akses Enterprise
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/subscription')}
                  >
                    Lihat Semua Paket
                    <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400">
                  🚀 Dalam masa beta, request akan diproses oleh admin.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Already Premium */}
          {subscriptionType === 'PREMIUM' && (
            <Card className="border border-amber-200 bg-gradient-to-br from-amber-50/30 to-yellow-50/30">
              <CardContent className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Anda Pengguna Premium! 🎉</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Nikmati semua fitur premium tanpa batasan.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/subscription')}
                  className="text-sm"
                >
                  Kelola Langganan
                  <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className={cn(
                'mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3',
                requestType === 'PREMIUM'
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500',
              )}>
                {requestType === 'PREMIUM' ? (
                  <Crown className="w-7 h-7 text-white" />
                ) : (
                  <Sparkles className="w-7 h-7 text-white" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Request Akses {requestType === 'PREMIUM' ? 'Premium' : 'Enterprise'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {requestType === 'PREMIUM'
                  ? 'Dapatkan akses ke semua template premium, export Excel, dan fitur lainnya.'
                  : 'Layanan eksklusif — undangan akan dibuatkan oleh tim kami.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  placeholder={
                    requestType === 'PREMIUM'
                      ? 'Contoh: Saya membutuhkan fitur export Excel dan template premium untuk acara pernikahan saya...'
                      : 'Contoh: Saya ingin tim Invitee yang membuatkan undangan pernikahan saya...'
                  }
                  rows={4}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitAccessRequest}
                  loading={requestPremiumLoading}
                  className={cn(
                    'flex-1 text-white',
                    requestType === 'PREMIUM'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
                  )}
                >
                  Kirim Permintaan
                </Button>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                🚀 Permintaan akan diproses oleh admin dalam masa beta.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
