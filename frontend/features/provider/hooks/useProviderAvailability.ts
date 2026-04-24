// features/provider/hooks/useProviderAvailability.ts

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi } from '@/lib/api/client';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface UseProviderAvailabilityReturn {
  slots: TimeSlot[];
  loading: boolean;
  error: string | null;
  updateSlots: (slots: TimeSlot[]) => Promise<void>;
  toggleSlot: (index: number) => Promise<void>;
}

export function useProviderAvailability(): UseProviderAvailabilityReturn {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Initialize default slots
  useEffect(() => {
    const defaultSlots: TimeSlot[] = days.flatMap((day) => [
      { day, startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day, startTime: '14:00', endTime: '18:00', isAvailable: true },
      { day, startTime: '19:00', endTime: '22:00', isAvailable: day !== 'Dimanche' },
    ]);
    setSlots(defaultSlots);
    setLoading(false);
  }, []);

  const updateSlots = useCallback(async (newSlots: TimeSlot[]) => {
    setLoading(true);
    setError(null);
    try {
      // In real app, save to API
      // await providerApi.updateAvailability(newSlots);
      setSlots(newSlots);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des disponibilités');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSlot = useCallback(async (index: number) => {
    const newSlots = slots.map((slot, i) => 
      i === index ? { ...slot, isAvailable: !slot.isAvailable } : slot
    );
    await updateSlots(newSlots);
  }, [slots, updateSlots]);

  return { slots, loading, error, updateSlots, toggleSlot };
}