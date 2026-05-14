// frontend/lib/api/notifications/types.ts

export enum NotificationType {
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_REMINDER = 'reservation_reminder',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_EXPIRED = 'reservation_expired',
  PROMOTION = 'promotion',
  ADVERTISEMENT = 'advertisement',
  SYSTEM = 'system',
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  reservationId?: string;
  advertisementId?: string;
  data?: {
    startTime?: string;
    serviceName?: string;
    hoursBefore?: number;
    discountCode?: string;
    discountPercentage?: number;
    imageUrl?: string;
    actionUrl?: string;
    advertisementId?: string;
  };
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  channels?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}