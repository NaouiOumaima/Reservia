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
  CheckCircleIcon,
  MapIcon,
} from '@/components/ui/Icons';
import { CATEGORIES_MAP } from '@/lib/api/constants/categories.';

// ─── Day labels ───────────────────────────────────────────────────────────────

const DAY_FR: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={`${sz} ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
        />
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const serviceId = params?.id as string;

  const [service,      setService]      = useState<Service | null>(null);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeImg,    setActiveImg]    = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booking,      setBooking]      = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      try {
        const [svc, revs] = await Promise.all([
          servicesApi.getById(serviceId),
          reviewsApi.getByService(serviceId),
        ]);
        setService(svc);
        setReviews(Array.isArray(revs) ? revs : []);
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
      await reservationsApi.create({
        serviceId,
        startTime: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
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

  const timeSlots = (): string[] => {
    if (!service) return [];
    const slots: string[] = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      if (service.duration <= 60) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  };

  // ── Loading / not found ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sdp-loading">
        <div className="sdp-spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="sdp-not-found">
        <p className="sdp-not-found-msg">Service introuvable</p>
        <button onClick={() => router.back()} className="sdp-back-link">← Retour</button>
      </div>
    );
  }

  const catInfo   = CATEGORIES_MAP.get(service.category);
  const todayStr  = new Date().toISOString().split('T')[0];
  const hasImages = service.images && service.images.length > 0;
  const hasSlots  = service.availabilitySlots && service.availabilitySlots.length > 0;
  const hasCoords =
    service.location?.coordinates?.length === 2 &&
    service.location.coordinates[0] !== 0;

  // URL vers la carte avec l'id du service en query param
  const mapUrl = `/client/carte?serviceId=${serviceId}`;

  // ── Page ──────────────────────────────────────────────────────────────
  return (
    <div className="sdp-page">
      <div className="sdp-container">

        {/* ── Breadcrumb / back ── */}
        <button className="sdp-back" onClick={() => router.back()}>
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Retour
        </button>

        {/* ══════════════════════════════
            GALLERY
        ══════════════════════════════ */}
        {hasImages && (
          <div className="sdp-gallery">
            {/* Main image */}
            <div className="sdp-gallery-main">
              <Image
                src={service.images[activeImg]}
                alt={`${service.name} — photo ${activeImg + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
                priority
              />
              {/* Overlay badge */}
              <div className="sdp-gallery-badge">
                {catInfo?.icon && (
                  <span className="sdp-gallery-badge-icon">{catInfo.icon}</span>
                )}
                <span>{catInfo?.frenchLabel ?? service.category}</span>
              </div>
              {/* Active indicator */}
              {service.images.length > 1 && (
                <div className="sdp-gallery-count">
                  {activeImg + 1} / {service.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {service.images.length > 1 && (
              <div className="sdp-gallery-thumbs">
                {service.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`sdp-gallery-thumb ${i === activeImg ? 'sdp-gallery-thumb--active' : ''}`}
                  >
                    <Image src={img} alt={`miniature ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            HEADING + META
        ══════════════════════════════ */}
        <div className="sdp-heading-row">
          <div className="sdp-heading-main">
            <div className="sdp-title-row">
              <h1 className="sdp-title">{service.name}</h1>
              {service.status === 'active' && (
                <span className="sdp-active-badge">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Actif
                </span>
              )}
            </div>

            <div className="sdp-meta">
              {/* Rating */}
              <div className="sdp-meta-item">
                <StarRow rating={service.avgRating ?? 0} />
                <span className="sdp-meta-val">
                  {(service.avgRating ?? 0).toFixed(1)}
                </span>
                <span className="sdp-meta-muted">
                  ({service.reviewCount ?? 0} avis)
                </span>
              </div>

              <span className="sdp-meta-sep">·</span>

              {/* Duration */}
              <div className="sdp-meta-item">
                <ClockIcon className="w-4 h-4 sdp-meta-icon" />
                <span>{service.duration} min</span>
              </div>

              <span className="sdp-meta-sep">·</span>

              {/* Location */}
              <div className="sdp-meta-item">
                <MapPinIcon className="w-4 h-4 sdp-meta-icon" />
                <span>
                  {service.location?.city}
                  {service.location?.city && service.location?.governorate ? ', ' : ''}
                  {service.location?.governorate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            LAYOUT : main + sidebar
        ══════════════════════════════ */}
        <div className="sdp-layout">

          {/* ── Colonne principale ── */}
          <div className="sdp-main">

            {/* Description */}
            <section className="sdp-panel">
              <h2 className="sdp-panel-title">À propos de ce service</h2>
              <p className="sdp-desc">{service.description || 'Aucune description disponible.'}</p>
            </section>

            {/* Prestataire */}
            <section className="sdp-panel">
              <h2 className="sdp-panel-title">Prestataire</h2>
              <div className="sdp-meta-item">
                <UserIcon className="w-5 h-5 sdp-meta-icon" />
                <span className="sdp-provider-name">
                  {service.providerName ?? 'Non spécifié'}
                </span>
              </div>
            </section>

            {/* ── Disponibilités ── */}
            {hasSlots && (
              <section className="sdp-panel">
                <h2 className="sdp-panel-title">Disponibilités</h2>
                <div className="sdp-slots">
                  {service.availabilitySlots!.map((slot, i) => (
                    <div
                      key={i}
                      className={`sdp-slot ${slot.isAvailable ? 'sdp-slot--open' : 'sdp-slot--closed'}`}
                    >
                      <span className="sdp-slot-day">
                        {DAY_FR[slot.day.toLowerCase()] ?? slot.day}
                      </span>
                      <span className="sdp-slot-hours">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className={`sdp-slot-badge ${slot.isAvailable ? 'sdp-slot-badge--open' : 'sdp-slot-badge--closed'}`}>
                        {slot.isAvailable ? 'Disponible' : 'Fermé'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Localisation ── */}
            <section className="sdp-panel sdp-location-panel">
              <div className="sdp-location-header">
                <h2 className="sdp-panel-title sdp-panel-title--no-mb">Localisation</h2>

                {/* Bouton → carte */}
                {hasCoords && (
                  <button
                    onClick={() => router.push(mapUrl)}
                    className="sdp-map-btn"
                  >
                    <MapIcon className="w-4 h-4" />
                    Voir sur la carte
                  </button>
                )}
              </div>

              <div className="sdp-location-body">
                <MapPinIcon className="w-5 h-5 sdp-meta-icon sdp-location-pin" />
                <div>
                  <p className="sdp-location-address">{service.location?.address}</p>
                  <p className="sdp-location-sub">
                    {service.location?.city}
                    {service.location?.city && service.location?.governorate ? ', ' : ''}
                    {service.location?.governorate}
                    {service.location?.postalCode ? ` — ${service.location.postalCode}` : ''}
                  </p>
                </div>
              </div>

              {/* Mini static map preview (OpenStreetMap iframe) */}
              {hasCoords && (
                <div className="sdp-map-preview">
                  <iframe
                    title="Aperçu carte"
                    src={
                      `https://www.openstreetmap.org/export/embed.html` +
                      `?bbox=${service.location.coordinates[0] - 0.01},${service.location.coordinates[1] - 0.01},` +
                      `${service.location.coordinates[0] + 0.01},${service.location.coordinates[1] + 0.01}` +
                      `&layer=mapnik&marker=${service.location.coordinates[1]},${service.location.coordinates[0]}`
                    }
                    className="sdp-map-iframe"
                    loading="lazy"
                  />
                  <button
                    onClick={() => router.push(mapUrl)}
                    className="sdp-map-overlay-btn"
                  >
                    <MapIcon className="w-4 h-4" />
                    Ouvrir dans la carte interactive
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* ── Avis clients ── */}
            <section className="sdp-panel">
              <div className="sdp-reviews-header">
                <h2 className="sdp-panel-title sdp-panel-title--no-mb">Avis clients</h2>
                <button
                  onClick={() => router.push(`/service/${serviceId}/review`)}
                  className="sdp-review-cta"
                >
                  Donner mon avis
                </button>
              </div>

              {reviews.length === 0 ? (
                <p className="sdp-desc">Aucun avis pour le moment. Soyez le premier !</p>
              ) : (
                <div className="sdp-review-list">
                  {reviews.slice(0, 5).map((r) => (
                    <div key={r._id} className="sdp-review-item">
                      <div className="sdp-review-top">
                        <StarRow rating={r.rating} size="sm" />
                        <span className="sdp-review-author">
                          {r.userName ?? 'Client anonyme'}
                        </span>
                      </div>
                      <p className="sdp-review-comment">{r.comment}</p>
                    </div>
                  ))}
                  {reviews.length > 5 && (
                    <button className="sdp-show-more">
                      Voir les {reviews.length - 5} autres avis
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar réservation ── */}
          <aside className="sdp-sidebar">
            <div className="sdp-booking-card">
              <div className="sdp-booking-free-row">
                <span className="sdp-booking-free-label">Service gratuit</span>
                <span className="sdp-booking-duration">{service.duration} min</span>
              </div>

              <div className="sdp-booking-field">
                <label className="sdp-booking-label">Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="sdp-booking-input"
                />
              </div>

              <div className="sdp-booking-field">
                <label className="sdp-booking-label">Horaire</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate}
                  className="sdp-booking-select"
                >
                  <option value="">Sélectionner un horaire</option>
                  {timeSlots().map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBooking}
                disabled={booking || !selectedDate || !selectedTime}
                className="sdp-booking-btn"
              >
                {booking ? 'Réservation en cours…' : 'Réserver gratuitement'}
              </button>

              <p className="sdp-booking-note">
                Annulation gratuite sous 24 h
              </p>

              {/* Quick map shortcut in sidebar */}
              {hasCoords && (
                <button
                  onClick={() => router.push(mapUrl)}
                  className="sdp-sidebar-map-btn"
                >
                  <MapPinIcon className="w-4 h-4" />
                  Voir l&apos;emplacement sur la carte
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}