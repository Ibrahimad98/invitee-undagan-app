'use client';

import { Menu, Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Ensure localStorage is fully cleared
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
    router.push('/login');
  };

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
            <span className="font-bold text-gray-900">Invitee</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar name={user?.fullName || 'U'} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.fullName}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
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
