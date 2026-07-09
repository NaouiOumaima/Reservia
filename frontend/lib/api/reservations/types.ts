// src/api/reservation/types/reservation.ts

export interface Reservation {
  _id: string;
  clientId: string;
  serviceId: string;
  serviceName?: string;
  serviceLocation?: {
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
  };
  providerName?: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  expiresAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface CreateReservationData {
  serviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
}