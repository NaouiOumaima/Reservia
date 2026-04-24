// app/provider/reviews/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const respondToReview = (reviewId: string, response: string) => {
    // API call to respond
    console.log('Responding to review:', reviewId, response);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Avis & notes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Consulter et répondre aux avis clients
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex justify-center text-yellow-500 mt-2">
              {'★'.repeat(5)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Note moyenne</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
            <p className="text-sm text-gray-500">Total avis</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-2xl font-bold text-green-600">{stats.fiveStars + stats.fourStars}</p>
            <p className="text-sm text-gray-500">Positifs (4-5★)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-2xl font-bold text-red-600">{stats.oneStar + stats.twoStars}</p>
            <p className="text-sm text-gray-500">Négatifs (1-2★)</p>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun avis
            </h3>
            <p className="text-gray-500">
              Vous n'avez pas encore reçu d'avis clients
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-500">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.isReported && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Signalé
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 dark:text-white mb-2">
                      {review.comment}
                    </p>
                    <p className="text-sm text-gray-500">
                      Par {review.userName} • {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Response */}
                <div className="mt-4 pl-4 border-l-4 border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Votre réponse:</p>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    rows={2}
                    placeholder="Répondre à cet avis..."
                  ></textarea>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Envoyer la réponse
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