import { LayoutDashboard, Mail, Palette, Users, MessageSquare, User, PlusCircle, Shield } from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Undangan Saya', href: '/dashboard/invitations', icon: Mail },
  { label: 'Template', href: '/dashboard/templates', icon: Palette },
  { label: 'Kontak / Tamu', href: '/dashboard/contacts', icon: Users },
  { label: 'Testimoni', href: '/dashboard/testimonials', icon: MessageSquare },
  { label: 'Profil', href: '/dashboard/profile', icon: User },
  { label: 'Kelola User', href: '/dashboard/users', icon: Shield, adminOnly: true },
];

export const STEPPER_LABELS = [
  'Info Dasar',
  'Detail Acara',
  'Profil',
  'Galeri',
  'Amplop Digital',
  'Pilih Tema',
  'Preview',
];

export const CATEGORY_COLORS: Record<string, string> = {
  elegan: 'bg-purple-100 text-purple-800',
  budaya: 'bg-amber-100 text-amber-800',
  bunga: 'bg-pink-100 text-pink-800',
  gold: 'bg-yellow-100 text-yellow-800',
  muslim: 'bg-emerald-100 text-emerald-800',
  anak: 'bg-orange-100 text-orange-800',
  wayang: 'bg-stone-100 text-stone-800',
  simple: 'bg-gray-100 text-gray-800',
  natal: 'bg-red-100 text-red-800',
  slide: 'bg-blue-100 text-blue-800',
  formal: 'bg-slate-100 text-slate-800',
  colorful: 'bg-cyan-100 text-cyan-800',
};
