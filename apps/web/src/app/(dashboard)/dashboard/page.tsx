'use client';

import { useDashboardStats } from '@/hooks/queries/use-dashboard-stats';
import { useTemplates } from '@/hooks/queries/use-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Eye, Mail, Users, CheckCircle, XCircle, Clock, PlusCircle, Palette, Star, ArrowRight, Send, BookOpen } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: templateData } = useTemplates();
  const { user } = useAuthStore();
  const router = useRouter();

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
