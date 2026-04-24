// app/admin/pending-services/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/types';

export default function AdminPendingServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const approveService = (serviceId: string) => {
    setServices(services.filter(s => s._id !== serviceId));
  };

  const rejectService = (serviceId: string, reason: string) => {
    // API call to reject with reason
    setServices(services.filter(s => s._id !== serviceId));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Services à valider
          </h1>
          <p className="text-gray-400 mt-1">
            Valider ou rejeter les nouveaux fournisseurs
          </p>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun service en attente
            </h3>
            <p className="text-gray-400">
              Tous les services ont été validés
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full">
                        En attente de validation
                      </span>
                      <span className="text-sm text-gray-400">
                        {service.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>📍 {service.location.city}, {service.location.governorate}</span>
                      <span>💰 {service.price} DT</span>
                      <span>⭐ Note: {service.rating.toFixed(1)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      Fournisseur: {service.providerName}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8 flex space-x-4">
                    <button
                      onClick={() => approveService(service._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Motif du rejet:');
                        if (reason) rejectService(service._id, reason);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}