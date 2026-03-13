import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Testimonial, PaginatedResponse } from '@invitee/shared';

export function useTestimonials(page = 1, limit = 20, all = false) {
  return useQuery({
    queryKey: ['testimonials', page, limit, all],
    queryFn: async () => {
      const endpoint = all ? '/testimonials/all' : '/testimonials';
      const { data } = await api.get<PaginatedResponse<Testimonial>>(endpoint, {
        params: { page, limit },
      });
      return data;
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/testimonials', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useApproveTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      const { data } = await api.patch(`/testimonials/${id}/approve`, { isApproved });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}
