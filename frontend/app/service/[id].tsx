'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { servicesApi, reviewsApi, reservationsApi } from '@/lib/api/client';
import { Service, Review } from '@/types';
import ReviewsList from '@/features/review/ReviewsList';
import ReservationForm from '@/features/reservation/ReservationForm';

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params?.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          servicesApi.getById(serviceId),
          reviewsApi.getByServiceId(serviceId),
        ]);
        setService(serviceRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Failed to fetch service details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!service) return <div className="text-center py-12">Service not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="mt-2 text-gray-600">{service.description}</p>

            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
<span className="text-2xl font-bold text-blue-600">
  ${service.price}
</span>              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-2 text-gray-600">
                  {service.rating.toFixed(1)} ({service.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="mt-4">
<p className="text-gray-600">
  {service.location.address}
</p>            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <ReviewsList reviews={reviews} />
          </div>
          <div>
            <ReservationForm serviceId={serviceId} />
          </div>
        </div>
      </div>
    </div>
  );
}
