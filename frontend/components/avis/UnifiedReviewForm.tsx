// frontend/components/UnifiedReviewForm.tsx
'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/ui/Icons';
import { reviewsApi } from '@/lib/api/reviews';
import { useAuth } from '@/providers/AuthProvider';

interface UnifiedReviewFormProps {
  type: 'app' | 'service';
  serviceId?: string;
  serviceName?: string;
  onSuccess?: () => void;
}

export default function UnifiedReviewForm({ 
  type, 
  serviceId, 
  serviceName, 
  onSuccess 
}: UnifiedReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canReview = () => {
    if (!user) return false;
    if (user.role === 'provider' && type === 'service') {
      return false;
    }
    return true;
  };

  const getTitle = () => {
    if (type === 'app') {
      return `Donnez votre avis sur Reservia`;
    }
    return `Donnez votre avis sur ${serviceName || 'ce service'}`;
  };

  const getSubtitle = () => {
    if (type === 'app') {
      return 'Votre opinion nous aide à améliorer la plateforme';
    }
    return 'Votre avis aide les autres clients à choisir ce service';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Veuillez vous connecter pour laisser un avis' });
      return;
    }

    if (rating === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une note' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // ✅ CORRECTION : Ne pas envoyer 'type' dans le body
      // L'API détermine le type par la présence ou non de serviceId
      const reviewData: any = {
        rating,
        comment,
      };
      
      // Si c'est un avis sur un service, ajouter serviceId
      if (type === 'service' && serviceId) {
        reviewData.serviceId = serviceId;
      }
      // Si c'est un avis sur l'app, NE PAS envoyer serviceId
      
      console.log('Sending review data:', reviewData);
      await reviewsApi.create(reviewData);

      setMessage({ type: 'success', text: 'Merci pour votre avis !' });
      setRating(0);
      setComment('');
      
      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      console.error('Response:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Une erreur est survenue' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === 'provider' && type === 'service') {
    return (
      <div className="card text-center p-6">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-[rgb(var(--foreground))] font-semibold mb-2">
          Réservé aux clients
        </p>
        <p className="text-sm text-[rgb(var(--foreground-muted))]">
          En tant que fournisseur, vous pouvez uniquement donner votre avis sur l'application.
        </p>
        <a href="/about" className="btn btn-primary btn-sm mt-4">
          Donner mon avis sur Reservia
        </a>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card text-center p-6">
        <p className="text-[rgb(var(--foreground-muted))] mb-4">
          Connectez-vous pour donner votre avis
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/login" className="btn btn-primary btn-sm">Se connecter</a>
          <a href="/register" className="btn btn-ghost btn-sm">S'inscrire</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
        {getTitle()}
      </h3>
      <p className="text-sm text-[rgb(var(--foreground-muted))] mb-4">
        {getSubtitle()}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Votre note *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`w-8 h-8 ${
                    star <= (hover || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="label">Votre commentaire *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="input"
            rows={4}
            required
            minLength={10}
          />
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.length < 10}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
        </button>
      </form>
    </div>
  );
}