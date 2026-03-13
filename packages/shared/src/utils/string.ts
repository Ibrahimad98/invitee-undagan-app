export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function generateGuestUrl(
  baseUrl: string,
  slug: string,
  themeId: string,
  guestName: string,
): string {
  const encodedName = encodeURIComponent(guestName);
  return `${baseUrl}/${slug}/${themeId}?kpd=${encodedName}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
