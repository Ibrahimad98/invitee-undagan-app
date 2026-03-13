import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardStats } from '@invitee/shared';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStats }>('/invitations/dashboard/stats');
      return data.data;
    },
  });
}
