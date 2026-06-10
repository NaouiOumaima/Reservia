// app/service/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { servicesApi, reviewsApi, reservationsApi } from '@/lib/api';
import type { Service } from '@/lib/api/services/types';
import type { Review } from '@/lib/api/reviews/types';
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

export default function () {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      try {
        const [serviceData, reviewsData] = await Promise.all([
          servicesApi.getById(serviceId),
          reviewsApi.getByService(serviceId),
        ]);
        setService(serviceData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Veuillez sélectionner une date et un horaire');
      return;
    }
    setBooking(true);
    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      await reservationsApi.create({
        serviceId,
        startTime: startTime.toISOString(),
        duration: service?.duration ?? 60,
      });
      alert('Réservation effectuée avec succès !');
      router.push('/client/bookings');
    } catch (err) {
      console.error('Erreur réservation:', err);
      alert('Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  };

  const generateTimeSlots = () => {
    if (!service) return [];
    const slots: string[] = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      if (service.duration <= 60) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  };

  /* ── États ── */
  if (loading) {
    return (
      <div className="sp-page-loading">
        <div className="sp-spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="sp-page-not-found">
        <p className="sp-not-found-title">Service non trouvé</p>
        <button onClick={() => router.back()} className="sp-back-btn">
          ← Retour
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  /* ── Page ── */
  return (
    <div className="sp-detail-page">
      <div className="sp-detail-container">

        {/* Back */}
        <button className="sp-detail-back" onClick={() => router.back()}>
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Retour
        </button>

        {/* Gallery */}
        {service.images && service.images.length > 0 && (
          <div className="sp-detail-gallery">
            <div className="sp-detail-gallery-main">
              <Image
                src={service.images[0]}
                alt={service.name}
                fill
                sizes="(max-width: 640px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>
            {service.images.length > 1 && (
              <div className="sp-detail-gallery-thumbs">
                {service.images[1] && (
                  <div className="sp-detail-gallery-thumb">
                    <Image
                      src={service.images[1]}
                      alt={`${service.name} 2`}
                      fill
                      sizes="(max-width: 640px) 0vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {service.images[2] && (
                  <div className="sp-detail-gallery-thumb">
                    <Image
                      src={service.images[2]}
                      alt={`${service.name} 3`}
                      fill
                      sizes="(max-width: 640px) 0vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Heading */}
        <h1 className="sp-detail-heading">{service.name}</h1>

        {/* Meta */}
        <div className="sp-detail-meta">
          <div className="sp-detail-meta-item">
            <StarIcon className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="sp-detail-rating-val">
              {service.avgRating?.toFixed(1) ?? '0.0'}
            </span>
            <span className="text-foreground-muted">
              ({service.reviewCount ?? 0} avis)
            </span>
          </div>
          {(service.location?.city || service.location?.governorate) && (
            <div className="sp-detail-meta-item">
              <MapPinIcon className="w-4 h-4" />
              {service.location.city}
              {service.location.city && service.location.governorate ? ', ' : ''}
              {service.location.governorate}
            </div>
          )}
          <div className="sp-detail-meta-item">
            <ClockIcon className="w-4 h-4" />
            {service.duration} min
          </div>
        </div>

        {/* Layout */}
        <div className="sp-detail-layout">

          {/* Colonne principale */}
          <div className="sp-detail-main">

            {/* Description */}
            <div className="sp-detail-panel">
              <h2 className="sp-detail-panel-title">À propos de ce service</h2>
              <p className="sp-detail-desc">{service.description}</p>
            </div>

            {/* Prestataire */}
            <div className="sp-detail-panel">
              <h2 className="sp-detail-panel-title">Prestataire</h2>
              <div className="sp-detail-meta-item">
                <UserIcon className="w-5 h-5" />
                <span>{service.providerName ?? 'Non spécifié'}</span>
              </div>
            </div>

            {/* Avis */}
            <div className="sp-detail-panel">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-border">
                <h2 className="m-0 text-base font-bold">
                  Avis clients
                </h2>
                <button
                  onClick={() => router.push(`/service/${serviceId}/review`)}
                  className="sp-back-btn m-0"
                >
                  Donner mon avis
                </button>
              </div>

              {reviews.length === 0 ? (
                <p className="sp-detail-desc">
                  Aucun avis pour le moment. Soyez le premier !
                </p>
              ) : (
                <div className="sp-review-list">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="sp-review-item">
                      <div className="sp-review-stars">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating 
                                ? 'fill-yellow-500 text-yellow-500' 
                                : 'text-yellow-500/30'
                            }`}
                          />
                        ))}
                        <span className="sp-review-author ml-2">
                          Par {review.userName ?? 'Client'}
                        </span>
                      </div>
                      <p className="sp-review-comment">{review.comment}</p>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <button className="sp-back-btn self-start">
                      Voir tous les {reviews.length} avis
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar réservation */}
          <div className="sp-booking-sidebar">
            <div className="sp-booking-panel">
              <div className="sp-booking-price-row">
                <p className="sp-booking-free-label">Service gratuit</p>
                <p className="sp-booking-duration-hint">{service.duration} minutes</p>
              </div>

              <div className="sp-booking-field">
                <label className="sp-booking-label">Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="sp-booking-input"
                />
              </div>

              <div className="sp-booking-field">
                <label className="sp-booking-label">Horaire</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="sp-booking-select"
                  disabled={!selectedDate}
                >
                  <option value="">Sélectionner un horaire</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBooking}
                disabled={booking || !selectedDate || !selectedTime}
                className="sp-booking-btn"
              >
                {booking ? 'Réservation en cours…' : 'Réserver gratuitement'}
              </button>

              <p className="sp-booking-note">
                Service gratuit · Annulation sous 24 h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}