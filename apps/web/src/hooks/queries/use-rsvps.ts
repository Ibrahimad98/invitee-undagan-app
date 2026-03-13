import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Rsvp, PaginatedResponse } from '@invitee/shared';

export function useRsvps(invitationId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['rsvps', invitationId, page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Rsvp>>('/rsvp', {
        params: { invitationId, page, limit },
      });
      return data;
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
