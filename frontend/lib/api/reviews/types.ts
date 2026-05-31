// lib/api/reviews/types.ts

// Note: Review type is defined here, separate from Service type
export interface Review {
  _id: string;
  userId: string | { _id: string; firstName: string; lastName: string; email: string };
  userName: string;
  userEmail?: string;
  serviceId?: string | { _id: string; name: string };
  serviceName?: string;
  serviceProviderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: {
    text: string;
    createdAt: string;
  };
  responseDate?: Date;
  isApproved: boolean;
  isReported: boolean;
  reportReason?: 'spam' | 'offensive' | 'fake' | 'inappropriate' | 'other';
  reportDetails?: string;
  reportedAt?: string;
  isDeleted?: boolean;
  helpful?: number;
  createdAt: string | Date;
  updatedAt?: string;
  reviewType?: 'service' | 'app';
}

export interface CreateReviewData {
  serviceId?: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReportReviewData {
  reason: 'spam' | 'offensive' | 'fake' | 'inappropriate' | 'other';
  details?: string;
}

export interface PaginatedReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  page: number;
  totalPages: number;
}

export interface UpdateReviewData {
  comment?: string;
  rating?: number;
  images?: string[];
}