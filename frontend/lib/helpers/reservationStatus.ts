// frontend/lib/helpers/reservationStatus.ts

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  expired: 'Expirée',
};

export const RESERVATION_STATUS_BADGES: Record<string, string> = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  completed: 'badge-primary',
  cancelled: 'badge-error',
  expired: 'badge-error',
};
