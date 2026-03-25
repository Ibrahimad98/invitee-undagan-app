import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginPayload, RegisterPayload, AuthTokens } from '@invitee/shared';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      login: async (payload: LoginPayload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<{ data: AuthTokens }>('/auth/login', payload);
          const { accessToken, user } = data.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<{ data: any }>('/auth/register', {
            ...payload,
            baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
          });
          const result = data.data || data;

          // If email verification is required, don't set auth state
          if (result.needsVerification) {
            set({ isLoading: false });
            return result; // { needsVerification: true, message, email }
          }

          // No verification needed — set auth state directly
          const { accessToken, user } = result;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
