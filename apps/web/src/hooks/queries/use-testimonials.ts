import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Testimonial } from '@invitee/shared';

interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useTestimonials(page = 1, limit = 20, all = false) {
  return useQuery<PaginatedResult<Testimonial>>({
    queryKey: ['testimonials', page, limit, all],
    queryFn: async () => {
      const endpoint = all ? '/testimonials/all' : '/testimonials';
      const { data } = await api.get(endpoint, {
        params: { page, limit },
      });
      // Unwrap TransformInterceptor
      return (data as any)?.data || data;
    },
  });
}

export function useMyTestimonials() {
  return useQuery<{ data: Testimonial[] }>({
    queryKey: ['testimonials', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/testimonials/mine');
      return (data as any)?.data || data;
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

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/testimonials/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}
