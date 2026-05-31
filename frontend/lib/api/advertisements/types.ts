// frontend/lib/api/advertisements/types.ts

export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageBase64?: string;  // Nouveau format (base64)
  imageUrl?: string;     // Ancien format (URL)
  providerId: string;
  providerName: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: string;
  status: 'active' | 'expired' | 'draft' | 'paused' | 'inactive';
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
  imageBase64: string;
  discountCode?: string;
  discountPercentage?: number;
  validUntil?: string;
}