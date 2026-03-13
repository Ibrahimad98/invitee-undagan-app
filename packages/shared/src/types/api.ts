export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  user: import('./user').User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface DashboardStats {
  totalInvitations: number;
  totalViews: number;
  totalRsvps: number;
  attendingCount: number;
  notAttendingCount: number;
  pendingCount: number;
  recentInvitations: import('./invitation').Invitation[];
}
