import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Template, TemplateFilter } from '@invitee/shared';

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useTemplates(filters?: TemplateFilter & { admin?: boolean }) {
  return useQuery<PaginatedResult<Template>>({
    queryKey: ['templates', filters],
    queryFn: async () => {
      const { admin, ...params } = filters || {};
      const endpoint = admin ? '/templates/admin' : '/templates';
      const { data } = await api.get(endpoint, {
        params,
      });
      // Unwrap TransformInterceptor: { success, data: { data: [...], meta } }
      return (data as any)?.data || data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Template }>(`/templates/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
