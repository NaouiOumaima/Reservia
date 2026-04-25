// frontend/lib/api/chatbot/chat.ts

import { apiClient } from '../config';
import { ChatRequest, ChatResponse, StreamingChunk } from './types';

/**
 * Envoie un message au chatbot
 * @param request - La requête contenant le message utilisateur
 * @returns La réponse du chatbot
 */
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>('/ai/chatbot', request);
    
    // S'assurer que la réponse contient un sessionId
    const data = response.data;
    if (!data.sessionId && request.sessionId) {
      data.sessionId = request.sessionId;
    }
    
    return data;
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    
    if (error.response?.status === 429) {
      throw new Error('Trop de requêtes. Veuillez patienter.');
    }
    
    throw new Error(error.response?.data?.message || 'Erreur de communication avec le chatbot');
  }
}

/**
 * Envoie un message avec gestion de session (conversation continue)
 * @param query - Le message utilisateur
 * @param sessionId - ID de session (optionnel, sera généré si non fourni)
 * @param userId - ID utilisateur (optionnel)
 * @returns La réponse et le sessionId
 */
export async function sendMessageWithSession(
  query: string,
  sessionId?: string,
  userId?: string
): Promise<{ response: ChatResponse; sessionId: string }> {
  const currentSessionId = sessionId || generateSessionId();
  
  const request: ChatRequest = {
    query,
    sessionId: currentSessionId,
    userId,
  };
  
  const response = await sendMessage(request);
  
  return {
    response,
    sessionId: currentSessionId,
  };
}

/**
 * Envoie un message avec géolocalisation
 * @param query - Le message utilisateur
 * @param lat - Latitude
 * @param lng - Longitude
 * @param userId - ID utilisateur (optionnel)
 */
export async function sendMessageWithLocation(
  query: string,
  lat: number,
  lng: number,
  userId?: string
): Promise<ChatResponse> {
  return sendMessage({
    query,
    userId,
    location: { lat, lng },
  });
}

/**
 * Streaming de la réponse (simule une réponse progressive)
 * @param request - La requête
 * @param onChunk - Callback appelé à chaque chunk
 */
export async function streamMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await apiClient.post('/ai/chatbot/stream', request);
    const fullResponse = response.data.reply;
    
    // Simule le streaming caractère par caractère
    for (let i = 0; i < fullResponse.length; i++) {
      onChunk(fullResponse[i]);
      await sleep(20); // 20ms entre chaque caractère
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

/**
 * Génère un ID de session unique
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Helper pour le délai
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Récupère l'historique de la conversation (si backend le supporte)
 * @param sessionId - ID de session
 */
export async function getConversationHistory(sessionId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/ai/conversation/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
}

/**
 * Efface l'historique d'une conversation
 * @param sessionId - ID de session
 */
export async function clearConversation(sessionId: string): Promise<void> {
  try {
    await apiClient.delete(`/ai/conversation/${sessionId}`);
  } catch (error) {
    console.error('Clear conversation error:', error);
  }
}

/**
 * Détecte l'intention d'un message sans envoyer de requête complète
 * @param text - Le texte à analyser
 */
export async function detectIntent(text: string): Promise<{ intent: string; confidence: number }> {
  try {
    const response = await apiClient.post('/ai/detect-intent', { text });
    return response.data;
  } catch (error) {
    console.error('Intent detection error:', error);
    return { intent: 'unknown', confidence: 0 };
  }
}