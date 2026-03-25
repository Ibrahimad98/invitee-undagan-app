import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Guest } from '@invitee/shared';

interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useGuests(invitationId: string, params?: { search?: string; page?: number; limit?: number }) {
  return useQuery<PaginatedResult<Guest>>({
    queryKey: ['guests', invitationId, params],
    queryFn: async () => {
      const { data } = await api.get('/guests', {
        params: { invitationId, page: params?.page || 1, limit: params?.limit || 50, search: params?.search },
      });
      // Unwrap TransformInterceptor
      return (data as any)?.data || data;
    },
    enabled: !!invitationId,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, payload }: { invitationId: string; payload: any }) => {
      const { data } = await api.post('/guests', { ...payload, invitationId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { invitationId: string; id: string; payload: any }) => {
      const { data } = await api.patch(`/guests/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useMarkGuestSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sentVia }: { invitationId: string; id: string; sentVia: string }) => {
      const { data } = await api.patch(`/guests/${id}/sent`, { sentVia });
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
    mutationFn: async ({ invitationId, payload }: { invitationId: string; payload: { guests: any[] } }) => {
      const { data } = await api.post('/guests/import', { invitationId, ...payload });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useImportGuestsExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, file }: { invitationId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invitationId', invitationId);
      const { data } = await api.post('/guests/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
    mutationFn: async ({ id }: { invitationId: string; id: string }) => {
      const { data } = await api.delete(`/guests/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}
