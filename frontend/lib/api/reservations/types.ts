// frontend/lib/api/reservations/types.ts
export interface CreateReservationData {
  serviceId: string;
  numberOfPersons: number;
  reservationDateTime: string;  // ✅ Changé: date et heure exacte
  notes?: string;
}

export interface Reservation {
  _id: string;
  clientId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  serviceId: string | {
    _id: string;
    name?: string;
    images?: string[];
    location?: string;
    avgRating?: number;
    duration?: number;
  };
  providerId: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  numberOfPersons: number;
  reservationDateTime: string;  // ✅ Nouveau champ
  price: number;  // Sera toujours 0 (100% gratuit)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  reviewId?: string;
  expiresAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}