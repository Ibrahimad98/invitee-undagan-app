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
  register: (payload: RegisterPayload) => Promise<void>;
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
          const { data } = await api.post<{ data: AuthTokens }>('/auth/register', payload);
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
