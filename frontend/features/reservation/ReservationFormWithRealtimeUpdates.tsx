'use client';

import { useState } from 'react';
import { reservationsApi } from '@/lib/api/client';
import { useNotifications } from '@/features/auth/hooks/useNotifications';

interface ReservationFormProps {
  serviceId: string;
  userId: string;
}

export default function ReservationFormWithRealtimeUpdates({
  serviceId,
  userId,
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<string | null>(null);

  // Hook pour les notifications en temps réel
  const { socket, notifications } = useNotifications(userId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await reservationsApi.create({
        serviceId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        notes: formData.notes,
      });

      const resId = response.data._id;
      setReservationId(resId);
      setReservationStatus('pending');
      setMessage('✓ Réservation créée! En attente de confirmation...');
      setFormData({ startTime: '', endTime: '', notes: '' });

      // ✨ Écouter les mises à jour en temps réel
      if (socket) {
        socket.on('reservation:updated', (data: any) => {
          if (data.reservationId === resId) {
            setReservationStatus(data.status);
            setMessage(`✓ Réservation ${data.status}!`);
          }
        });
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Échec de la réservation');
      setReservationStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Faire une réservation</h3>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes('Échec')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Statut de la réservation en temps réel */}
      {reservationId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-900">
            ID de réservation: {reservationId}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl">
              {reservationStatus === 'pending' && '⏳'}
              {reservationStatus === 'confirmed' && '✅'}
              {reservationStatus === 'cancelled' && '❌'}
              {reservationStatus === 'expired' && '⏰'}
            </span>
            <p className="text-sm text-blue-700 capitalize">
              Statut: <strong>{reservationStatus}</strong>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date et heure de début
          </label>
          <input
            type="datetime-local"
            name="startTime"
            required
            value={formData.startTime}
            onChange={handleChange}
            disabled={loading || !!reservationId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date et heure de fin
          </label>
          <input
            type="datetime-local"
            name="endTime"
            required
            value={formData.endTime}
            onChange={handleChange}
            disabled={loading || !!reservationId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes supplémentaires (optionnel)
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            disabled={loading || !!reservationId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Demandes spéciales ou notes..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!reservationId}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création...' : 'Réserver maintenant'}
        </button>
      </form>

      {/* Historique des notifications */}
      {notifications.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Historique des mises à jour
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.map((notif, idx) => (
              <div
                key={idx}
                className="text-xs p-2 bg-gray-50 rounded border-l-2 border-blue-400"
              >
                <p className="font-medium text-gray-900">
                  {notif.data?.title || notif.type}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {notif.data?.message || JSON.stringify(notif.data)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-yellow-800 border border-yellow-200">
        <p className="font-semibold mb-1">⏱️ Délai d'expiration</p>
        <p>Votre réservation expirera dans 10 minutes si non confirmée.</p>
        <p className="mt-2 text-xs">
          🔔 Les mises à jour en temps réel s'affichent ci-dessus
        </p>
      </div>
    </div>
  );
}
