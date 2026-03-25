'use client';

import { useState, useEffect } from 'react';
import { useDashboardStats } from '@/hooks/queries/use-dashboard-stats';
import { useTemplates } from '@/hooks/queries/use-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Eye, Mail, Users, CheckCircle, XCircle, Clock, PlusCircle, Palette, Star, ArrowRight, Send, BookOpen, X, PartyPopper, FlaskConical, Crown, Sparkles, Zap, Check } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import Link from 'next/link';
import { api } from '@/lib/api';

const SUB_LABELS: Record<string, string> = { BASIC: 'Basic', PREMIUM: 'Premium', FAST_SERVE: 'Enterprise' };
const SUB_COLORS: Record<string, string> = {
  BASIC: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
  FAST_SERVE: 'bg-emerald-100 text-emerald-700',
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: templateData } = useTemplates();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPremiumCongrats, setShowPremiumCongrats] = useState(false);

  const isPremiumUser = user?.subscriptionType === 'PREMIUM' || user?.subscriptionType === 'FAST_SERVE';

  // Show welcome/premium popup:
  // 1) First-time login as premium/enterprise → show congrats
  // 2) First-time login as basic → show welcome
  // 3) Subscription changed from BASIC to PREMIUM/FAST_SERVE → show congrats
  useEffect(() => {
    if (!user) return;

    const STORAGE_KEY = `lastSubType_${user.id}`;
    const lastSubType = localStorage.getItem(STORAGE_KEY);

    if (user.isFirstLogin) {
      if (isPremiumUser) {
        setShowPremiumCongrats(true);
      } else {
        setShowWelcome(true);
      }
      localStorage.setItem(STORAGE_KEY, user.subscriptionType);
    } else if (
      lastSubType &&
      lastSubType === 'BASIC' &&
      isPremiumUser
    ) {
      // Subscription upgraded from BASIC → Premium/Enterprise
      setShowPremiumCongrats(true);
    } else {
      // Update stored value
      localStorage.setItem(STORAGE_KEY, user.subscriptionType);
    }
  }, [user?.id, user?.isFirstLogin, user?.subscriptionType, isPremiumUser]);

  const handleDismissWelcome = async () => {
    setShowWelcome(false);
    setShowPremiumCongrats(false);
    try {
      // Update stored subscription type so popup doesn't show again
      if (user) {
        localStorage.setItem(`lastSubType_${user.id}`, user.subscriptionType);
      }
      if (user?.isFirstLogin) {
        await api.post('/auth/first-login-complete');
        if (user) setUser({ ...user, isFirstLogin: false });
      }
    } catch {}
  };

  const templates = templateData?.data || [];

  const statCards = [
    { label: 'Total Undangan', value: stats?.totalInvitations ?? 0, icon: Mail, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Dilihat', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-purple-600 bg-purple-50' },
    { label: 'Hadir', value: stats?.attendingCount ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Tidak Hadir', value: stats?.notAttendingCount ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Menunggu', value: stats?.pendingCount ?? 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total RSVP', value: stats?.totalRsvps ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Congratulations Popup for First Login */}
      {showPremiumCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            {/* Decorative gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
            <button
              onClick={handleDismissWelcome}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center pt-2">
              {/* Premium icon with glow */}
              <div className="relative mx-auto mb-5 w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Selamat, {user?.fullName?.split(' ')[0]}! 🎉
              </h2>
              <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 mb-3">
                Anda adalah Pengguna {user?.subscriptionType === 'FAST_SERVE' ? 'Enterprise' : 'Premium'}!
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Selamat datang di <strong>Invitee</strong>! Akun Anda telah aktif dengan akses penuh ke semua fitur premium. Mari buat undangan impian Anda!
              </p>

              {/* Premium features highlight */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-4 mb-5 text-left">
                <p className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Keuntungan Akses Premium Anda:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Semua template premium tersedia',
                    `Kuota hingga ${user?.maxGuests?.toLocaleString() ?? '2.000'} tamu`,
                    'Export data ke Excel',
                    'Download PDF per undangan tamu',
                    'Unlimited galeri foto',
                    'Prioritas dukungan',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleDismissWelcome}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Mulai Buat Undangan Premium
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Popup for First Login */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={handleDismissWelcome}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selamat Datang, {user?.fullName?.split(' ')[0]}! 🎉
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Terima kasih telah bergabung dengan <strong>Invitee Beta</strong>!
                Anda sekarang bisa mulai membuat undangan digital pertama Anda.
              </p>
              <div className="bg-gradient-to-br from-primary-50 to-amber-50 rounded-xl p-4 mb-4 text-left">
                <p className="font-semibold text-gray-800 text-sm mb-2">🚀 Langkah Cepat:</p>
                <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>Pilih template undangan yang Anda suka</li>
                  <li>Isi detail acara dan informasi tamu</li>
                  <li>Publish & bagikan link ke tamu undangan</li>
                </ol>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${SUB_COLORS[user?.subscriptionType || 'BASIC']}`}>
                  {user?.subscriptionType === 'PREMIUM' ? <Crown className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                  {SUB_LABELS[user?.subscriptionType || 'BASIC']}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">Maks {user?.maxGuests ?? 100} tamu</span>
              </div>
              <Button onClick={handleDismissWelcome} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Mulai Buat Undangan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Selamat Datang{user?.fullName ? `, ${user.fullName}` : ''}! 👋
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              Buat dan kelola undangan digital Anda dengan mudah dan cepat.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase">
                {user?.subscriptionType === 'PREMIUM' ? <Crown className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                {SUB_LABELS[user?.subscriptionType || 'BASIC']}
              </span>
              <span className="text-primary-200 text-xs">Maks {user?.maxGuests ?? 100} tamu</span>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard/invitations/new')}
            className="bg-white text-primary-600 hover:bg-primary-50 shrink-0"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Buat Undangan
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Buat Undangan', icon: PlusCircle, href: '/dashboard/invitations/new', color: 'bg-blue-50 text-blue-600' },
          { label: 'Template', icon: Palette, href: '/dashboard/templates', color: 'bg-purple-50 text-purple-600' },
          { label: 'Kontak', icon: BookOpen, href: '/dashboard/contacts', color: 'bg-green-50 text-green-600' },
          { label: 'Kirim Undangan', icon: Send, href: '/dashboard/invitations', color: 'bg-amber-50 text-amber-600' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Showcase */}
      {templates.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Template Populer</CardTitle>
            <Link
              href="/dashboard/templates"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {templates.slice(0, 6).map((template: any) => (
                <Link
                  key={template.id}
                  href={`/preview/${template.slug}`}
                  target="_blank"
                  className="flex-shrink-0 w-36 group"
                >
                  <div className="h-44 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 mb-2">
                    <img
                      src={`/images/templates/${template.slug}.svg`}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate">{template.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {template.ratingAvg?.toFixed(1) || '0.0'}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Undangan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentInvitations?.length ? (
            <div className="space-y-4">
              {stats.recentInvitations.map((inv: any) => (
                <Link
                  key={inv.id}
                  href={`/dashboard/invitations/${inv.id}/edit`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{inv.title}</p>
                    <p className="text-sm text-gray-500">
                      {EVENT_TYPE_LABELS[inv.eventType] || inv.eventType} • {inv.viewCount} dilihat
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.isPublished
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {inv.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeTime(inv.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-2">Belum ada undangan</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/dashboard/invitations/new')}
              >
                Buat Undangan Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
