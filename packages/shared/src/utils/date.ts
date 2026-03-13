export function formatDate(dateStr: string, locale = 'id-ID'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5) + ' WIB';
}

export function getCountdown(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
