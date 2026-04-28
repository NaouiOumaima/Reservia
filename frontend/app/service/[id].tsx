'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesApi, reviewsApi, reservationsApi } from '@/lib/api';
import { Service, Review } from '@/types';
import { StarIcon, LocationIcon, ClockIcon, CalendarIcon } from '@/components/ui/Icons';

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
        {/* Image */}
        {service.images?.[0] && (
          <img src={service.images[0]} alt={service.name} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}

        {/* Titre et infos */}
        <h1 className="text-3xl font-bold text-foreground mb-2">{service.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-warning">
            <StarIcon className="w-5 h-5 fill-current" />
            <span className="font-medium">{service.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted">({service.reviewCount} avis)</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <LocationIcon className="w-4 h-4" />
            <span>{service.location.city}, {service.location.governorate}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne gauche - Description */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted">{service.description}</p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Avis clients</h2>
              {reviews.length === 0 ? (
                <p className="text-muted">Aucun avis pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
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
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Réservation */}
          <div>
            <div className="card sticky top-24">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-primary">{service.basePrice} DT</span>
                <span className="text-muted"> / {service.duration} min</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Horaire</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input"
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
                  className="btn btn-primary w-full"
                >
                  {booking ? 'Réservation en cours...' : 'Réserver maintenant'}
                </button>
                <p className="text-xs text-muted text-center mt-2">
                  Paiement sécurisé • Annulation gratuite sous 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}