import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface PublicTestimonial {
  id: string;
  userName: string;
  message: string;
  rating: number;
  ratingDesain?: number;
  ratingKemudahan?: number;
  ratingLayanan?: number;
  notes?: string;
  createdAt: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
}

export function useTestimonialsPublic() {
  const [data, setData] = useState<PublicTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API_BASE}/testimonials?page=1&limit=10`);
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        const json = await res.json();
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
    fetchTestimonials();
  }, []);

  return { data, isLoading, error };
}
