import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Guest, PaginatedResponse } from '@invitee/shared';

export function useGuests(invitationId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['guests', invitationId, page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Guest>>('/guests', {
        params: { invitationId, page, limit },
      });
      return data;
    },
    enabled: !!invitationId,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/guests', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useImportGuests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { invitationId: string; guests: any[] }) => {
      const { data } = await api.post('/guests/import', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/guests/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}
