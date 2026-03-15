import { useState, useEffect } from 'react';

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

export function useTemplatesPublic() {
  const [data, setData] = useState<PublicTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API_URL}/templates/public`);
        if (!res.ok) throw new Error('Failed to fetch templates');
        const json = await res.json();
        // API may return { data: [...] } or { success, data: { data: [...] } }
        const payload = json?.data;
        const result = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(json)
              ? json
              : [];
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  return { data, isLoading, error };
}
