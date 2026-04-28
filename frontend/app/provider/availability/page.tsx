'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon } from '@/components/ui/Icons';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const defaultSlots: TimeSlot[] = DAYS.flatMap((day) => [
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
    // Appel API pour sauvegarder les disponibilités
    console.log('Disponibilités sauvegardées :', slots);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Disponibilités / Créneaux</h1>
          <p className="text-muted mt-1">Définissez vos horaires et créneaux disponibles</p>
        </div>

        <div className="card p-6">
          {DAYS.map((day) => (
            <div key={day} className="border border-border rounded-lg p-4 mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{day}</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={slots.some((s) => s.day === day && s.isAvailable)}
                    readOnly
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="ml-2 text-sm text-muted">Jour actif</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slots
                  .filter((s) => s.day === day)
                  .map((slot, idx) => {
                    const globalIndex = slots.findIndex(
                      (s) => s.day === day && s.startTime === slot.startTime
                    );
                    return (
                      <div key={idx} className="flex items-center space-x-2">
                        <select
                          value={slot.startTime}
                          onChange={() => {}}
                          className="input !py-1 text-sm w-24"
                        >
                          {HOURS.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="text-muted">à</span>
                        <select
                          value={slot.endTime}
                          onChange={() => {}}
                          className="input !py-1 text-sm w-24"
                        >
                          {HOURS.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={() => toggleSlot(globalIndex)}
                            className="w-4 h-4 text-primary rounded"
                          />
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="btn btn-primary">
              Enregistrer les disponibilités
            </button>
          </div>
        </div>

        <div className="mt-8 card p-6">
          <h3 className="font-semibold text-foreground mb-4">Modèles rapides</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-ghost">9h-17h (Pause midi)</button>
            <button className="btn btn-ghost">8h-20h (Continu)</button>
            <button className="btn btn-ghost">24h/24</button>
            <button className="btn btn-ghost">Sur rendez-vous</button>
          </div>
        </div>
      </div>
    </div>
  );
}