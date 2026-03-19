export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string | null;
  address?: string | null;
  role: 'USER' | 'ADMIN';
  subscriptionType: 'BASIC' | 'PREMIUM';
  subscriptionExpireDate?: string | null;
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
