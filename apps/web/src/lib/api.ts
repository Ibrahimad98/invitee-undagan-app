import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    // Only access store on client side
    if (typeof window !== 'undefined') {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect if already on auth pages — prevents refresh loop
      const isAuthPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAuthPage) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
