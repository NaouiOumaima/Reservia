export interface Review {
  _id: string;
  userId: string;
  userName?: string;
  serviceId: string;
  serviceName?: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: string;
  responseDate?: Date;
  isApproved: boolean;
  isReported: boolean;
  createdAt: Date;
}

export interface CreateReviewData {
  serviceId: string;
  rating: number;
  comment: string;
  images?: string[];
}