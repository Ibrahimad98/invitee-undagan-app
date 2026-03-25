export interface Testimonial {
  id: string;
  userId?: string;
  templateId?: string;
  userName: string;
  message: string;
  rating: number;
  ratingDesain: number;
  ratingKemudahan: number;
  ratingLayanan: number;
  notes?: string;
  isApproved: boolean;
  createdAt: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl?: string;
    category: string;
  };
}

export interface CreateTestimonialPayload {
  templateId: string;
  userName: string;
  message: string;
  rating: number;
  ratingDesain: number;
  ratingKemudahan: number;
  ratingLayanan: number;
  notes?: string;
}
