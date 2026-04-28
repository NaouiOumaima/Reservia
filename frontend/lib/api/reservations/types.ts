export interface Reservation {
  _id: string;
  userId: string;
  serviceId: string;
  serviceName?: string;
  providerName?: string;
  date?: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  createdAt: Date;
}

export interface CreateReservationData {
  serviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
}