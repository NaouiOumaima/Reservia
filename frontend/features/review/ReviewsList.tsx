import { Review } from '@/types';

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center">
                    <span className="text-yellow-400">
                      {'★'.repeat(Math.round(review.rating))}
                    </span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {review.rating.toFixed(1)} stars
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {review.comment && (
                <p className="text-gray-700">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
