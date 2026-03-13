export interface Testimonial {
  id: string;
  userName: string;
  message: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateTestimonialPayload {
  userName: string;
  message: string;
  rating: number;
}
