// app/provider/availability/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { servicesApi } from '@/lib/api/services';
import { Service, ServiceSlot } from '@/lib/api/services/types';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const DEFAULT_SLOTS = (day: string): ServiceSlot[] => [
  { day, startTime: '09:00', endTime: '12:00', isAvailable: true },
  { day, startTime: '14:00', endTime: '17:00', isAvailable: true },
  { day, startTime: '19:00', endTime: '22:00', isAvailable: day !== 'Dimanche' },
];

export default function ProviderAvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdFromUrl = searchParams.get('serviceId');

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(serviceIdFromUrl);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);

  const loadServices = useCallback(async () => {
    try {
      const data = await servicesApi.getByProvider();
      setServices(data);
      
      if (!selectedServiceId && data.length > 0) {
        setSelectedServiceId(data[0]._id);
      }
    } catch (err) {
      setError('Erreur lors du chargement des services');
    }
  }, [selectedServiceId]);

  const loadService = useCallback(async () => {
    if (!selectedServiceId) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await servicesApi.getById(selectedServiceId);
      setService(data);

      if (data.slots && data.slots.length > 0) {
        // Essayer de convertir si c'est au format backend
        const anySlots = data.slots as any;
        if (anySlots[0] && 'duration' in anySlots[0]) {
          // Format backend, utiliser les défauts
          setSlots(DAYS.flatMap(DEFAULT_SLOTS));
        } else {
          // Déjà au format frontend
          setSlots(data.slots as ServiceSlot[]);
        }
      } else {
        setSlots(DAYS.flatMap(DEFAULT_SLOTS));
      }
    } catch (err) {
      setError('Erreur lors du chargement du service');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId]);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      setLoading(true);
      loadService();
    }
  }, [selectedServiceId, loadService]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    router.replace(`/provider/availability?serviceId=${serviceId}`);
  };

  const toggleSlot = (index: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === index ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const updateSlotTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots(prev => prev.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const addSlotForDay = (day: string) => {
    setSlots(prev => [...prev, { day, startTime: '09:00', endTime: '12:00', isAvailable: true }]);
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Convertir les slots frontend en format backend
  const convertSlotsToBackendFormat = (frontendSlots: ServiceSlot[]) => {
    // Compter le nombre total de créneaux disponibles
    const availableSlots = frontendSlots.filter(slot => slot.isAvailable);
    const totalSlots = availableSlots.length;
    
    // Calculer la durée moyenne en minutes
    let totalDuration = 0;
    availableSlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      totalDuration += (endHour - startHour) * 60;
    });
    
    const avgDuration = totalSlots > 0 ? Math.floor(totalDuration / totalSlots) : 60;
    
    // Retourner un tableau avec un seul élément (ou plusieurs selon le besoin)
    return [
      {
        duration: avgDuration,
        maxReservationsPerSlot: totalSlots > 0 ? totalSlots : 1,
      }
    ];
  };

  const saveAvailability = async () => {
    if (!selectedServiceId) { setError('Aucun service sélectionné'); return; }
    setSaving(true);
    setError(null);
    try {
      // ✅ Convertir les slots au format backend avant envoi
      const backendSlots = convertSlotsToBackendFormat(slots);
      
      await servicesApi.updateAvailability(selectedServiceId, { slots: backendSlots });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError("Erreur lors de l'enregistrement des disponibilités");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !service) {
    return (
      <div className="prov-avail-loading">
        <div className="spinner" />
        <p className="text-gray-600">Chargement…</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="prov-avail-loading">
        <p className="text-gray-600">Aucun service trouvé.</p>
        <Link href="/provider/services" className="prov-avail-back">← Créer un service</Link>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="prov-avail-loading">
        <p className="text-gray-600">Service introuvable.</p>
        <Link href="/provider/services" className="prov-avail-back">← Retour aux services</Link>
      </div>
    );
  }

  const slotsByDay = DAYS.map(day => ({
    day,
    slots: slots.filter(slot => slot.day === day),
  }));

  return (
    <div className="prov-avail-page">
      <div className="prov-avail-container">

        <div className="prov-avail-header">
          <Link href="/provider/services" className="prov-avail-back">
            ← Retour aux services
          </Link>
          <h1 className="prov-avail-title">🕐 Disponibilités</h1>
          <p className="prov-avail-subtitle">
            Gérez les créneaux horaires de vos services
          </p>
        </div>

        <div className="prov-avail-service-selector">
          <label className="prov-avail-service-label">Service :</label>
          <select
            value={selectedServiceId || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="prov-avail-service-select"
          >
            {services.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} {!s.isActive ? '(inactif)' : s.isPendingApproval ? '(en attente)' : ''}
              </option>
            ))}
          </select>
        </div>

        {saved && (
          <div className="prov-avail-notice success">
            ✅ Disponibilités enregistrées avec succès !
          </div>
        )}
        {error && (
          <div className="prov-avail-notice error">
            ❌ {error}
          </div>
        )}

        <div className="prov-avail-panel">
          <div className="prov-avail-panel-header">
            <h2 className="prov-avail-service-title">{service.name}</h2>
          </div>

          <div className="prov-avail-day-list">
            {slotsByDay.map(({ day, slots: daySlots }) => (
              <div key={day} className="prov-avail-day">
                <div className="prov-avail-day-header">
                  <div className="prov-avail-day-name">
                    {day}
                    {daySlots.length > 0 && (
                      <span className="prov-avail-day-count">
                        {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''}
                      </span>
                    )}
                  </div>
                  <button onClick={() => addSlotForDay(day)} className="prov-avail-add-slot-btn">
                    + Ajouter un créneau
                  </button>
                </div>

                <div className="prov-avail-slots">
                  {daySlots.map((slot, idx) => {
                    const globalIndex = slots.findIndex(
                      s => s.day === slot.day &&
                           s.startTime === slot.startTime &&
                           s.endTime === slot.endTime &&
                           s.isAvailable === slot.isAvailable
                    );
                    return (
                      <div
                        key={idx}
                        className={`prov-avail-slot-row ${slot.isAvailable ? 'available' : 'unavailable'}`}
                      >
                        <select
                          value={slot.startTime}
                          onChange={e => updateSlotTime(globalIndex, 'startTime', e.target.value)}
                          className="prov-avail-slot-select"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>

                        <span className="prov-avail-slot-arrow">→</span>

                        <select
                          value={slot.endTime}
                          onChange={e => updateSlotTime(globalIndex, 'endTime', e.target.value)}
                          className="prov-avail-slot-select"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>

                        <label className="prov-avail-toggle-wrapper">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={() => toggleSlot(globalIndex)}
                          />
                          <span className="prov-avail-toggle-label">Disponible</span>
                        </label>

                        <button
                          onClick={() => removeSlot(globalIndex)}
                          className="prov-avail-remove-slot"
                          aria-label="Supprimer le créneau"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}

                  {daySlots.length === 0 && (
                    <p className="prov-avail-day-empty">Aucun créneau défini pour ce jour</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="prov-avail-panel-footer">
            <Link href="/provider/services" className="prov-avail-footer-cancel">
              Annuler
            </Link>
            <button
              onClick={saveAvailability}
              disabled={saving}
              className="prov-avail-footer-save"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}