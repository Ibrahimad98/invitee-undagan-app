'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, User, Crown, CheckCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useRouter } from 'next/navigation';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/queries/use-notifications';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { SubscriptionBadge } from '@/components/ui/subscription-badge';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markRead.mutate(notif.id);
    }
    setShowNotifications(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
    router.push('/login');
  };

  const subscriptionType = (user as any)?.subscriptionType || 'BASIC';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <img src="/favicon.svg" alt="Invitee" className="w-7 h-7" />
            <span className="font-bold text-orange-500">Invitee</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-semibold text-sm text-gray-900">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notif: any) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !notif.isRead ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notif.isRead && (
                            <span className="mt-1.5 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                          <div className={`flex-1 min-w-0 ${notif.isRead ? 'ml-5' : ''}`}>
                            <p className="text-sm font-medium text-gray-900 truncate">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <Avatar name={user?.fullName || 'U'} src={(user as any)?.avatarUrl} size="sm" />
                  {subscriptionType === 'PREMIUM' && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                      <Crown className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.fullName}
                  </span>
                  <SubscriptionBadge type={subscriptionType} size="sm" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span>{user?.email}</span>
                  <SubscriptionBadge type={subscriptionType} size="sm" />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
