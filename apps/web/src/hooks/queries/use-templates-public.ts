import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PublicTemplate {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  cssClass: string;
  isPremium: boolean;
  ratingAvg: number;
  usageCount: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseTemplatesPublicParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export function useTemplatesPublic(params: UseTemplatesPublicParams = {}) {
  const { page = 1, limit = 12, search, category } = params;
  const [data, setData] = useState<PublicTemplate[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', String(limit));
      if (search) queryParams.set('search', search);
      if (category) queryParams.set('category', category);

      const res = await fetch(`${API_URL}/templates/public?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const json = await res.json();
      // API returns { success, data: { data: [...], meta: {...} } }
      const payload = json?.data;
      const templates = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : Array.isArray(json)
            ? json
            : [];
      const paginationMeta = payload?.meta || null;
      setData(templates);
      setMeta(paginationMeta);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, category]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { data, meta, isLoading, error };
}
