// app/provider/availability/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  useEffect(() => {
    // Initialize with default slots
    const defaultSlots: TimeSlot[] = days.flatMap((day) => [
      { day, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day, startTime: '14:00', endTime: '18:00', isAvailable: true },
      { day, startTime: '19:00', endTime: '22:00', isAvailable: day !== 'Dimanche' },
    ]);
    setSlots(defaultSlots);
  }, []);

  const toggleSlot = (index: number) => {
    setSlots(slots.map((slot, i) => 
      i === index ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const handleSave = () => {
    // API call to save availability
    console.log('Saving availability:', slots);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Disponibilités / Créneaux
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Définissez vos horaires et créneaux disponibles
          </p>
        </div>

        {/* Availability Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{day}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slots.some(s => s.day === day && s.isAvailable)}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      Jour actif
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {slots.filter(s => s.day === day).map((slot, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <select
                        value={slot.startTime}
                        onChange={() => {}}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        {hours.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">à</span>
                      <select
                        value={slot.endTime}
                        onChange={() => {}}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        {hours.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={slot.isAvailable}
                          onChange={() => toggleSlot(slots.findIndex(s => s.day === day && s.startTime === slot.startTime))}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Enregistrer les disponibilités
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Modèles rapides
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
              9h-17h (Pause midi)
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
              8h-20h (Continu)
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
              24h/24
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
              Sur rendez-vous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}