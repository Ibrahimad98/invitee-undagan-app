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
      {/* Spinner + Favicon */}
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
        <img
          src="/favicon.svg"
          alt="Invitee"
          className="absolute w-7 h-7"
        />
      </div>

      {/* Text */}
      <p className="mt-5 text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}
