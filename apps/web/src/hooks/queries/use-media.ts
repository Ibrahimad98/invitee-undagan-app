import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      invitationId,
      purpose,
      sortOrder,
    }: {
      file: File;
      invitationId?: string;
      purpose: string;
      sortOrder?: number;
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      const params = new URLSearchParams();
      if (invitationId) params.append('invitationId', invitationId);
      params.append('purpose', purpose);
      if (sortOrder !== undefined) params.append('sortOrder', String(sortOrder));

      const { data } = await api.post(`/media/upload?${params.toString()}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/media/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}
