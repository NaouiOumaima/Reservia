'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { servicesApi, reviewsApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { Service } from '@/lib/api/services/types';
import StarRatingInput from '@/components/ui/StarRatingInput';
import { ArrowRightIcon } from '@/components/ui/Icons';

export default function ServiceReviewFormPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const serviceId = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      try {
        const serviceData = await servicesApi.getById(serviceId);
        setService(serviceData);
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Merci de choisir une note.');
      return;
    }
    if (!comment.trim()) {
      setError('Merci de rédiger un commentaire.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await reviewsApi.create({
        serviceId,
        rating,
        comment: comment.trim(),
        type: 'service',
      });
      router.push(`/service/${serviceId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Erreur lors de l'envoi de votre avis.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
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

  return (
    <div className="sp-detail-page">
      <div className="sp-detail-container" style={{ maxWidth: 640 }}>
        <button className="sp-detail-back" onClick={() => router.back()}>
          <ArrowRightIcon className="w-4 h-4 rotate-180" />
          Retour
        </button>

        <h1 className="sp-detail-heading">Donner mon avis</h1>
        <p className="text-muted mb-6">{service.name}</p>

        {!isAuthenticated ? (
          <div className="sp-detail-panel">
            <p className="sp-detail-desc mb-4">
              Vous devez être connecté avec un compte client pour évaluer un
              service.
            </p>
            <Link
              href={`/login?callbackUrl=/service/${serviceId}/review`}
              className="btn btn-primary"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sp-detail-panel">
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5">
              <label className="label">Votre note</label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>

            <div className="mb-5">
              <label className="label">Votre commentaire</label>
              <textarea
                required
                rows={5}
                className="input"
                placeholder="Partagez votre expérience avec ce service…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Envoi en cours…' : 'Publier mon avis'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
