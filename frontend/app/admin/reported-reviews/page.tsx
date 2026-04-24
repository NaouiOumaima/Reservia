// app/admin/reported-reviews/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';

export default function AdminReportedReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const approveReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r._id !== reviewId));
  };

  const deleteReview = (reviewId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      setReviews(reviews.filter(r => r._id !== reviewId));
    }
  };

  const dismissReport = (reviewId: string) => {
    setReviews(reviews.filter(r => r._id !== reviewId));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Avis signalés
          </h1>
          <p className="text-gray-400 mt-1">
            Modération des commentaires abusifs
          </p>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun avis signalé
            </h3>
            <p className="text-gray-400">
              Tous les avis sont conformes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-red-900 text-red-200 text-xs rounded-full">
                        Signalé
                      </span>
                      <div className="flex text-yellow-500">
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="text-white mb-2">
                      {review.comment}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Par: {review.userName}</span>
                      <span>Service: {review.serviceName}</span>
                      <span>Date: {new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Supprimer l'avis
                  </button>
                  <button
                    onClick={() => approveReview(review._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Garder l'avis
                  </button>
                  <button
                    onClick={() => dismissReport(review._id)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Ignorer le signalement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}