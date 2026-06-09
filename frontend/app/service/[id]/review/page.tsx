// app/service/[id]/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reviewsApi, servicesApi } from '@/lib/api';
import type { Service } from '@/lib/api/services/types';
import { StarIcon, ArrowRightIcon } from '@/components/ui/Icons';

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await servicesApi.getById(id as string);
        setService(data);
      } catch (error) {
        console.error('Erreur chargement du service:', error);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const submitReview = async () => {
    if (!comment.trim()) {
      alert('Veuillez écrire un commentaire');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({ 
        serviceId: id as string, 
        rating, 
        comment 
      });
      alert('Merci pour votre avis !');
      router.push(`/service/${id}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
      alert('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Service non trouvé</p>
          <button onClick={() => router.back()} className="btn btn-ghost mt-4">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition"
        >
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Retour
        </button>

        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-2">Donner mon avis</h1>
          <p className="text-muted text-center mb-6">
            Pour : <span className="font-semibold text-foreground">{service.name}</span>
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
                aria-label={`Noter ${star} étoiles`}
              >
                <StarIcon 
                  className={`w-10 h-10 ${
                    star <= rating 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input w-full px-3 py-2 border rounded-lg mb-4"
            rows={5}
            placeholder="Partagez votre expérience..."
          />

          <button 
            onClick={submitReview} 
            disabled={submitting} 
            className="btn btn-primary w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
          </button>
        </div>
      </div>
    </div>
  );
}