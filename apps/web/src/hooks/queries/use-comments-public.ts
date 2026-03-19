import { useState, useEffect, useCallback } from 'react';
import type { InvitationComment } from '@invitee/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PaginatedComments {
  data: InvitationComment[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useCommentsPublic(invitationId: string) {
  const [data, setData] = useState<InvitationComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!invitationId) return;
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/comments?invitationId=${invitationId}&page=1&limit=100`,
      );
      if (!res.ok) throw new Error('Failed to fetch comments');
      const json = await res.json();
      const payload = json?.data;
      const result = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { data, isLoading, error, refetch: fetchComments };
}

export function useCreateCommentPublic() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (payload: {
    invitationId: string;
    name: string;
    message: string;
  }) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const json = await res.json();
      return json?.data || json;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending, error };
}
