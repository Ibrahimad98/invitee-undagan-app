export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'USER' | 'ADMIN';
  subscriptionType: 'BASIC' | 'PREMIUM' | 'FAST_SERVE';
  subscriptionExpireDate?: string | null;
  maxGuests: number;
  isWhatsappVerified: boolean;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  address?: string;
}
