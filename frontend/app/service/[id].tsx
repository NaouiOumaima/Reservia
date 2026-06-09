// app/service/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesApi, reviewsApi, reservationsApi } from '@/lib/api';
import type { Service } from '@/lib/api/services/types';
import type { Review } from '@/lib/api/reviews/types';
import { StarIcon, MapPinIcon, ClockIcon, UserIcon, ArrowRightIcon } from '@/components/ui/Icons';

export default function ServiceDetailPage() {
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
    const fetchData = async () => {
      if (!serviceId) return;
      try {
        const [serviceData, reviewsData] = await Promise.all([
          servicesApi.getById(serviceId),
          reviewsApi.getByService(serviceId),
        ]);
        setService(serviceData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        duration: service?.duration || 60,
      });
      alert('Réservation effectuée avec succès !');
      router.push('/client/bookings');
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert('Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  if (!service) return <div className="text-center py-12">Service non trouvé</div>;

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 20; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      if (service.duration <= 60) slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-4 transition"
        >
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Retour
        </button>

        {/* Images */}
        {service.images && service.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="col-span-2">
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            {service.images[1] && (
              <img
                src={service.images[1]}
                alt={service.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
            {service.images[2] && (
              <img
                src={service.images[2]}
                alt={service.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {/* Titre et infos */}
        <h1 className="text-3xl font-bold text-foreground mb-2">{service.name}</h1>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-1 text-warning">
            <StarIcon className="w-5 h-5 fill-current" />
            <span className="font-medium">{service.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted">({service.reviewCount || 0} avis)</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <MapPinIcon className="w-4 h-4" />
            <span>{service.location?.city}, {service.location?.governorate}</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <ClockIcon className="w-4 h-4" />
            <span>{service.duration} min</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted leading-relaxed">{service.description}</p>
            </div>

            {/* Prestataire */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Prestataire</h2>
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-muted" />
                <span className="text-foreground">{service.providerName || 'Non spécifié'}</span>
              </div>
            </div>

            {/* Avis clients */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Avis clients</h2>
                <button
                  onClick={() => router.push(`/service/${serviceId}/review`)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Donner mon avis
                </button>
              </div>
              {reviews.length === 0 ? (
                <p className="text-muted">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review._id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-warning">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-muted">Par {review.userName || 'Client'}</span>
                      </div>
                      <p className="text-foreground">{review.comment}</p>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Voir tous les {reviews.length} avis
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar réservation */}
          <div>
            <div className="card sticky top-24">
              <div className="text-center mb-4">
                <span className="text-xl text-muted">Service GRATUIT</span>
                <p className="text-sm text-muted mt-1">{service.duration} minutes</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="label block text-sm font-medium mb-1">Horaire</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input w-full px-3 py-2 border rounded-lg"
                    disabled={!selectedDate}
                  >
                    <option value="">Sélectionner un horaire</option>
                    {generateTimeSlots().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={booking || !selectedDate || !selectedTime}
                  className="btn btn-primary w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {booking ? 'Réservation en cours...' : 'Réserver gratuitement'}
                </button>
                <p className="text-xs text-muted text-center mt-2">
                  Service gratuit • Annulation gratuite sous 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}