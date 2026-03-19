export interface Testimonial {
  id: string;
  userId?: string;
  userName: string;
  message: string;
  rating: number;
  ratingDesain: number;
  ratingKemudahan: number;
  ratingLayanan: number;
  notes?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateTestimonialPayload {
  userName: string;
  message: string;
  rating: number;
  ratingDesain: number;
  ratingKemudahan: number;
  ratingLayanan: number;
  notes?: string;
}
