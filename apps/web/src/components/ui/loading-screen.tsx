'use client';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingScreen({ fullScreen = true, message = 'Memuat...' }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0 min-h-screen' : 'w-full min-h-[60vh]',
      )}
    >
      {/* Animated Logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-primary-200 animate-ping opacity-20" />
        {/* Spinning ring */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-600 animate-spin" />
        {/* Logo center */}
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white font-bold text-lg tracking-tight">IN</span>
        </div>
      </div>

      {/* Text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-gray-600 animate-pulse">{message}</p>
        {/* Dots animation */}
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
