'use client';

import { Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export function SubscriptionBadge({ type, size = 'md' }: SubscriptionBadgeProps) {
  const isPremium = type === 'PREMIUM';
  const isFastServe = type === 'FAST_SERVE';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        isPremium
          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm'
          : isFastServe
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
      )}
    >
      {isPremium ? (
        <Crown className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      ) : isFastServe ? (
        <Zap className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      ) : (
        <Star className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      )}
      {isPremium ? 'Premium' : isFastServe ? 'Enterprise' : 'Basic'}
    </span>
  );
}
