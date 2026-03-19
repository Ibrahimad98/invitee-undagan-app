export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  supportedEventTypes?: string[];
  cssClass: string;
  layoutType: 'SCROLL' | 'SLIDE';
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilter {
  category?: string;
  search?: string;
  isPremium?: boolean;
  layoutType?: 'SCROLL' | 'SLIDE';
  eventType?: string;
  page?: number;
  limit?: number;
}
