'use client';

import { useState } from 'react';
import { reservationsApi } from '@/lib/api/client';

interface ReservationFormProps {
  serviceId: string;
}

export default function ReservationForm({ serviceId }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await reservationsApi.create({
        serviceId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        notes: formData.notes,
      });
      setMessage('Reservation created! You have 10 minutes to confirm.');
      setFormData({ startTime: '', endTime: '', notes: '' });
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Make a Reservation</h3>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            required
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            required
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            placeholder="Any special requests or notes..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Reserve Now'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <p className="font-semibold mb-1">⏱️ Reservation Timeout</p>
        <p>Your reservation will expire in 10 minutes if not confirmed.</p>
      </div>
    </div>
  );
}
