import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Rsvp } from '@invitee/shared';

interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useRsvps(invitationId: string, page = 1, limit = 50) {
  return useQuery<PaginatedResult<Rsvp>>({
    queryKey: ['rsvps', invitationId, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/rsvp', {
        params: { invitationId, page, limit },
      });
      // Unwrap TransformInterceptor
      return (data as any)?.data || data;
    },
    enabled: !!invitationId,
  });
}

export function useCreateRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/rsvp', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] });
    },
  });
}
