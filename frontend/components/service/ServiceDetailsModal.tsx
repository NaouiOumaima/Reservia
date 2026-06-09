// components/service/ServiceDetailsModal.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  XMarkIcon as XIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { Service } from '@/lib/api/services/types';

interface ServiceDetailsModalProps {
  service: Service | null;
  onClose: () => void;
  /** Appelé avec le service quand l'utilisateur clique "Plus de détails" */
  onBook?: (service: Service) => void;
}

export default function ServiceDetailsModal({ service, onClose, onBook }: ServiceDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!service) return null;

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      restaurant: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      hotel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      fitness: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      beauté: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      medical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      education: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      loisirs: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      transport: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
    return badges[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {service.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(service.category)}`}>
                {service.category}
              </span>
              {service.isActive && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-3 h-3" />
                  Actif
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Gallery */}
            {service.images && service.images.length > 0 && (
              <div className="mb-6">
                <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={service.images[selectedImage]}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {service.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${service.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Colonne gauche */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {service.description || 'Aucune description disponible.'}
                  </p>
                </div>

                {/* Durée */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durée</p>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {service.duration}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">minutes</span>
                  </div>
                </div>

                {/* Évaluation */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Évaluations
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-6 h-6 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {service.avgRating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/5</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {service.reviewCount} avis vérifiés
                    </div>
                  </div>
                </div>

                {/* Disponibilités */}
                {service.availabilitySlots && service.availabilitySlots.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Disponibilités
                    </h3>
                    <div className="space-y-2">
                      {service.availabilitySlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {slot.day}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isAvailable ? (
                            <span className="text-xs text-green-600 dark:text-green-400">Disponible</span>
                          ) : (
                            <span className="text-xs text-red-600 dark:text-red-400">Indisponible</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite */}
              <div className="space-y-6">
                {/* Localisation */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Localisation
                  </h3>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">{service.location.address}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {service.location.city}, {service.location.governorate}
                      </p>
                      {service.location.postalCode && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Code postal : {service.location.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prestataire */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Prestataire
                  </h3>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {service.providerName || 'Non spécifié'}
                    </span>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Informations complémentaires
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Référence</span>
                      <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{service._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Créé le</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(service.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Dernière mise à jour</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDate(service.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Score Smart</span>
                      <span className="text-gray-700 dark:text-gray-300">{service.smartScore || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — bouton "Plus de détails" */}
          <div className="sticky bottom-0 px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <button
                onClick={() => onBook?.(service)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Plus de détails
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}