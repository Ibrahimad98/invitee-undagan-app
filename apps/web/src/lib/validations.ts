import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
});

export const basicInfoSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter'),
  eventType: z.enum(['WEDDING', 'KHITANAN', 'BIRTHDAY', 'AQIQAH', 'ENGAGEMENT', 'CUSTOM']),
  openingText: z.string().optional(),
  closingText: z.string().optional(),
});

export const eventDetailsSchema = z.object({
  eventName: z.string().min(1, 'Nama acara wajib diisi'),
  eventDate: z.string().min(1, 'Tanggal wajib diisi'),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi'),
  endTime: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  mapUrl: z.string().optional(),
});

export const personProfileSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  nickname: z.string().optional(),
  parentFather: z.string().optional(),
  parentMother: z.string().optional(),
  childOrder: z.string().optional(),
  role: z.string().default('primary'),
  instagram: z.string().optional(),
});

export const giftAccountSchema = z.object({
  bankName: z.string().min(1, 'Nama bank wajib diisi'),
  accountNumber: z.string().min(1, 'Nomor rekening wajib diisi'),
  accountHolder: z.string().min(1, 'Nama pemilik rekening wajib diisi'),
});

export const guestSchema = z.object({
  name: z.string().min(1, 'Nama tamu wajib diisi'),
  phone: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  groupName: z.string().optional(),
});

export const rsvpSchema = z.object({
  guestName: z.string().min(1, 'Nama wajib diisi'),
  message: z.string().optional(),
  attendance: z.enum(['ATTENDING', 'NOT_ATTENDING', 'MAYBE']),
  numGuests: z.number().min(1).default(1),
});

export const testimonialSchema = z.object({
  userName: z.string().min(1, 'Nama wajib diisi'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
  rating: z.number().min(1).max(5),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>;
export type PersonProfileFormData = z.infer<typeof personProfileSchema>;
export type GiftAccountFormData = z.infer<typeof giftAccountSchema>;
export type GuestFormData = z.infer<typeof guestSchema>;
export type RsvpFormData = z.infer<typeof rsvpSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
