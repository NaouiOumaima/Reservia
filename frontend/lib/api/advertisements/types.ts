// frontend/lib/api/advertisements/types.ts

export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  providerId: string;
  providerName: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: string;
  status: 'active' | 'expired' | 'draft' | 'paused';
  targetAudience: string;
  targetCategory?: string;
  targetCity?: string;
  viewsCount: number;
  clicksCount: number;
  viewedBy: Array<{ userId: string; viewedAt: Date }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertisementData {
  title: string;
  description: string;
  imageUrl: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: string;
  targetAudience: string;
  targetCategory?: string;
  targetCity?: string;
}

export interface AdvertisementsResponse {
  advertisements: Advertisement[];
  total: number;
}