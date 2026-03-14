import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invitation } from '@invitee/shared';

interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useInvitations(params?: { page?: number; limit?: number }) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  return useQuery<PaginatedResult<Invitation>>({
    queryKey: ['invitations', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/invitations', {
        params: { page, limit },
      });
      // Unwrap TransformInterceptor: { success, data: { data: [...], meta } }
      return (data as any)?.data || data;
    },
  });
}

export function useInvitation(id: string) {
  return useQuery({
    queryKey: ['invitation', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Invitation }>(`/invitations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useInvitationPublic(slug: string) {
  return useQuery({
    queryKey: ['invitation-public', slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Invitation }>(`/invitations/public/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/invitations', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const { data } = await api.put(`/invitations/${id}`, payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['invitation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/invitations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
