import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SiteSetting {
  id: string;
  category: string;
  item: string;
  value: string;
  description?: string;
  sortOrder: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Public: fetch active settings */
export function useSettingsPublic(category?: string) {
  return useQuery<SiteSetting[]>({
    queryKey: ['settings-public', category],
    queryFn: async () => {
      const params = category ? { category } : {};
      const { data } = await api.get('/settings/public', { params });
      return Array.isArray(data) ? data : data.data || [];
    },
  });
}

/** Admin: fetch all settings */
export function useSettingsAdmin(category?: string) {
  return useQuery<SiteSetting[]>({
    queryKey: ['settings-admin', category],
    queryFn: async () => {
      const params = category ? { category } : {};
      const { data } = await api.get('/settings', { params });
      return Array.isArray(data) ? data : data.data || [];
    },
  });
}
