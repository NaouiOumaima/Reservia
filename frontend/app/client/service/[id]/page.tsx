// app/client/service/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { servicesApi } from '@/lib/api/services';
import { reservationsApi } from '@/lib/api/reservations/index';
import { useAuth } from '@/providers/AuthProvider';
import type { Service } from '@/lib/api/services/types';
import toast, { Toaster } from 'react-hot-toast';
import {
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from '@/components/ui/Icons';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 1,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await servicesApi.getById(params.id as string);
        setService(data);
      } catch (error) {
        console.error('Erreur chargement service:', error);
        toast.error('Service non trouvé');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  // ✅ Vérifier la disponibilité quand la date et l'heure changent
  useEffect(() => {
    const checkAvailability = async () => {
      if (!service || !bookingData.date || !bookingData.time) {
        setAvailability(null);
        return;
      }

      setCheckingAvailability(true);
      try {
        const dateTime = new Date(`${bookingData.date}T${bookingData.time}`);
        const result = await reservationsApi.checkAvailability(service._id, dateTime.toISOString());
        setAvailability(result);
      } catch (error: any) {
        console.error('Erreur vérification disponibilité:', error);
        setAvailability({ available: false, message: 'Erreur lors de la vérification' });
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [service, bookingData.date, bookingData.time]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour réserver');
      router.push('/login');
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      toast.error('Veuillez remplir tous les champs (date et heure)');
      return;
    }

    if (bookingData.guests < 1 || bookingData.guests > 50) {
      toast.error('Le nombre de personnes doit être entre 1 et 50');
      return;
    }

    // ✅ Vérifier la disponibilité avant de soumettre
    if (availability && !availability.available) {
      toast.error(availability.message || 'Ce créneau n\'est pas disponible');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Réservation en cours...');

    try {
      // ✅ Créer la date et heure de réservation
      const reservationDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
      
      // Vérifier que la date est valide
      if (isNaN(reservationDateTime.getTime())) {
        throw new Error('Date ou heure invalide');
      }

      console.log('📅 Réservation (format backend):', {
        serviceId: service!._id,
        numberOfPersons: bookingData.guests,
        reservationDateTime: reservationDateTime.toISOString(),
        notes: bookingData.notes,
      });
      
      // ✅ Envoyer uniquement les champs attendus par le backend
      await reservationsApi.create({
        serviceId: service!._id,
        numberOfPersons: bookingData.guests,
        reservationDateTime: reservationDateTime.toISOString(),
        notes: bookingData.notes,
      });

      toast.success('Demande de réservation envoyée ! En attente de confirmation du prestataire.', { id: toastId });
      setShowBookingModal(false);
      setBookingData({ date: '', time: '', guests: 1, notes: '' });
      setAvailability(null);
      
    } catch (error: any) {
      console.error('Erreur réservation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la réservation';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-loading">
        <div className="service-detail-spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-not-found">
        <h2>Service non trouvé</h2>
        <Link href="/search" className="btn-primary">Retour à la recherche</Link>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="service-detail-page">
        <div className="service-detail-container">
          {/* Bouton retour */}
          <button onClick={() => router.back()} className="service-detail-back">
            <ChevronLeftIcon className="w-5 h-5" />
            Retour
          </button>

          {/* Images */}
          <div className="service-detail-images">
            {service.images && service.images.length > 0 ? (
              <div className="service-detail-image-main">
                <Image
                  src={service.images[0]}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="service-detail-image-placeholder">
                <span className="text-6xl">📷</span>
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="service-detail-header">
            <div>
              <h1 className="service-detail-title">{service.name}</h1>
              <div className="service-detail-meta">
                <div className="service-detail-rating">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{service.avgRating?.toFixed(1) || 'Nouveau'}</span>
                  <span className="text-muted">({service.reviewCount || 0} avis)</span>
                </div>
                <span className="service-detail-category">{service.category}</span>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="service-detail-book-btn"
            >
              <CalendarIcon className="w-5 h-5" />
              Réserver gratuitement
            </button>
          </div>

          {/* Localisation */}
          <div className="service-detail-section">
            <h2 className="service-detail-section-title">
              <MapPinIcon className="w-5 h-5" />
              Localisation
            </h2>
            <p className="service-detail-address">{service.location?.address}</p>
            <p className="service-detail-city">
              {service.location?.city}, {service.location?.governorate}
            </p>
          </div>

          {/* Description */}
          <div className="service-detail-section">
            <h2 className="service-detail-section-title">Description</h2>
            <p className="service-detail-description">{service.description}</p>
          </div>

          {/* Détails */}
          <div className="service-detail-info-grid">
            <div className="service-detail-info-card">
              <ClockIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="service-detail-info-label">Durée</p>
                <p className="service-detail-info-value">{service.duration} minutes</p>
              </div>
            </div>
            <div className="service-detail-info-card">
              <UserIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="service-detail-info-label">Prestataire</p>
                <p className="service-detail-info-value">
                  {typeof service.providerId === 'object' 
                    ? `${service.providerId.firstName} ${service.providerId.lastName}`
                    : 'Prestataire'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showBookingModal && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h2 className="booking-modal-title">Réserver "{service.name}"</h2>
              <button onClick={() => setShowBookingModal(false)} className="booking-modal-close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="booking-modal-content">
              <div className="booking-modal-info">
                <p className="text-success font-medium">🆓 Service gratuit</p>
                <p className="text-muted text-sm">Durée: {service.duration} minutes</p>
              </div>

              <div className="booking-form-group">
                <label className="booking-form-label">Date</label>
                <input
                  type="date"
                  className="booking-form-input"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="booking-form-group">
                <label className="booking-form-label">Heure</label>
                <input
                  type="time"
                  className="booking-form-input"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  required
                />
              </div>

              {/* ✅ Affichage de la disponibilité */}
              {bookingData.date && bookingData.time && (
                <div className="booking-availability-info">
                  {checkingAvailability ? (
                    <p className="text-muted text-sm">Vérification de la disponibilité...</p>
                  ) : availability ? (
                    availability.available ? (
                      <p className="text-success text-sm">✅ Créneau disponible !</p>
                    ) : (
                      <p className="text-error text-sm">❌ {availability.message}</p>
                    )
                  ) : null}
                </div>
              )}

              <div className="booking-form-group">
                <label className="booking-form-label">Nombre de personnes</label>
                <input
                  type="number"
                  className="booking-form-input"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={50}
                  required
                />
                <p className="text-muted text-xs mt-1">Maximum 50 personnes</p>
              </div>

              <div className="booking-form-group">
                <label className="booking-form-label">Notes (optionnel)</label>
                <textarea
                  className="booking-form-textarea"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>
            </div>

            <div className="booking-modal-footer">
              <button
                onClick={() => setShowBookingModal(false)}
                className="booking-modal-btn-cancel"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={handleBooking}
                className="booking-modal-btn-submit"
                disabled={submitting || (availability && !availability.available) || checkingAvailability}
              >
                {submitting ? (
                  <div className="booking-spinner-small" />
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Confirmer la réservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}