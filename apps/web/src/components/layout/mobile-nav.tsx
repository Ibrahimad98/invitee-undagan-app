'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { X } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !(item as any).adminOnly || user?.role === 'ADMIN',
  );

  if (!sidebarOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Invitee" className="w-8 h-8" />
            <span className="font-bold text-lg text-gray-900">Invitee</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
