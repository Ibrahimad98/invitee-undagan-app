export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
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
}
