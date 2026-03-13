import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Template, PaginatedResponse, TemplateFilter } from '@invitee/shared';

export function useTemplates(filters?: TemplateFilter) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Template>>('/templates', {
        params: filters,
      });
      return data;
    },
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
