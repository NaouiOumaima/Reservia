// frontend/lib/api/chatbot/recommendations.ts

import { apiClient } from '../config';
import { RecommendationsResponse, RecommendationsRequest } from './types';

/**
 * Récupère les recommandations personnalisées pour un utilisateur
 * @param userId - ID de l'utilisateur
 * @param limit - Nombre de recommandations (défaut: 10)
 */
export async function getRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationsResponse> {
  try {
    const response = await apiClient.get<RecommendationsResponse>(
      '/ai/recommendations',
      {
        params: { userId, limit },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    throw new Error(error.response?.data?.message || 'Erreur de chargement des recommandations');
  }
}

/**
 * Récupère les services populaires (pour utilisateur non connecté)
 * @param limit - Nombre de résultats
 */
export async function getPopularServices(limit: number = 10): Promise<RecommendationsResponse> {
  try {
    const response = await apiClient.get<RecommendationsResponse>(
      '/ai/popular-services',
      { params: { limit } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get popular services error:', error);
    return [];
  }
}

/**
 * Récupère les services similaires à un service donné
 * @param serviceId - ID du service de référence
 * @param limit - Nombre de résultats
 */
export async function getSimilarServices(
  serviceId: string,
  limit: number = 5
): Promise<RecommendationsResponse> {
  try {
    const response = await apiClient.get<RecommendationsResponse>(
      `/ai/services/${serviceId}/similar`,
      { params: { limit } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get similar services error:', error);
    return [];
  }
}

/**
 * Rafraîchit les recommandations en temps réel
 * @param userId - ID utilisateur
 */
export async function refreshRecommendations(userId: string): Promise<void> {
  try {
    await apiClient.post('/ai/recommendations/refresh', { userId });
  } catch (error) {
    console.error('Refresh recommendations error:', error);
  }
}