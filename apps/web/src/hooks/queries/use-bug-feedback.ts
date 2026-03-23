import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useBugFeedbacks(all = false) {
  return useQuery({
    queryKey: ['bug-feedbacks', all ? 'all' : 'mine'],
    queryFn: async () => {
      const endpoint = all ? '/bug-feedback' : '/bug-feedback/mine';
      const { data } = await api.get(endpoint);
      return (data as any)?.data || data;
    },
  });
}

export function useCreateBugFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { subject: string; message: string; category?: string }) => {
      const { data } = await api.post('/bug-feedback', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-feedbacks'] });
    },
  });
}

export function useHandleBugFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const { data } = await api.patch(`/bug-feedback/${id}/handle`, { adminNote });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-feedbacks'] });
    },
  });
}

export function useUnhandleBugFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/bug-feedback/${id}/unhandle`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-feedbacks'] });
    },
  });
}

export function useDeleteBugFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/bug-feedback/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-feedbacks'] });
    },
  });
}
