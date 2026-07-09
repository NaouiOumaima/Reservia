'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { reviewsApi } from '@/lib/api';
import type { Review } from '@/lib/api/reviews/types';
import { StarIcon, PencilIcon, TrashIcon, SaveIcon, XMarkIcon, ReviewIcon } from '@/components/ui/Icons';

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getMyReviews();
      setReviews(Array.isArray(data) ? data.filter((r) => r.reviewType !== 'app') : []);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const startEdit = (review: Review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const updated = await reviewsApi.update(id, { rating: editRating, comment: editComment });
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingId(null);
    } catch (error) {
      console.error('Erreur modification avis:', error);
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await reviewsApi.deleteMine(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Erreur suppression avis:', error);
    }
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Mes Avis</h1>
          <p className="text-muted mt-1">
            {reviews.length > 0
              ? `${reviews.length} avis laissé${reviews.length > 1 ? 's' : ''} sur des services`
              : "Les avis que vous laissez sur les services apparaissent ici"}
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="card text-center py-12">
            <ReviewIcon className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun avis pour l&apos;instant</h3>
            <p className="text-muted mb-4">Laissez un avis après une réservation terminée.</p>
            <Link href="/client/bookings" className="btn btn-primary">Voir mes réservations</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const serviceName =
                typeof review.serviceId === 'object' ? review.serviceId?.name : review.serviceName;
              const isEditing = editingId === review._id;

              return (
                <div key={review._id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{serviceName || 'Service'}</p>
                      <p className="text-xs text-muted mb-2">{formatDate(review.createdAt)}</p>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" onClick={() => setEditRating(n)} aria-label={`${n} étoiles`}>
                                <StarIcon className={`w-5 h-5 ${n <= editRating ? 'text-warning' : 'text-muted'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="input w-full"
                            rows={3}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(review._id)}
                              disabled={saving}
                              className="btn btn-primary btn-sm"
                            >
                              <SaveIcon className="w-4 h-4" /> Enregistrer
                            </button>
                            <button onClick={cancelEdit} className="btn btn-ghost btn-sm">
                              <XMarkIcon className="w-4 h-4" /> Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <StarIcon key={n} className={`w-4 h-4 ${n <= review.rating ? 'text-warning' : 'text-muted'}`} />
                            ))}
                          </div>
                          <p className="text-foreground">{review.comment}</p>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(review)}
                          className="btn btn-ghost btn-sm"
                          aria-label="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeReview(review._id)}
                          className="btn btn-ghost btn-sm text-error"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
