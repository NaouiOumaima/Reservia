// frontend/lib/api/chatbot/utils.ts

import { ChatResponse } from './types';

/**
 * Formatte la réponse du chatbot pour l'affichage
 * @param response - Réponse du chatbot
 * @returns Texte formaté
 */
export function formatChatResponse(response: ChatResponse): string {
  let formatted = response.reply;
  
  // Ajouter une indication d'intention pour le debug
  if (process.env.NODE_ENV === 'development') {
    formatted += `\n\n[Intent: ${response.intent}]`;
  }
  
  return formatted;
}

/**
 * Extrait les actions suggérées de la réponse
 * @param response - Réponse du chatbot
 * @returns Liste des actions suggérées
 */
export function getSuggestedActions(response: ChatResponse): string[] {
  return response.suggestedActions || [];
}

/**
 * Vérifie si la réponse contient une erreur
 * @param response - Réponse du chatbot
 */
export function isErrorResponse(response: ChatResponse): boolean {
  return response.intent === 'error' || response.intent === 'rate_limited';
}

/**
 * Extrait les entités importantes de la réponse
 * @param response - Réponse du chatbot
 */
export function extractEntities(response: ChatResponse): any {
  return response.entities || {};
}

/**
 * Génère un message système pour le chat
 * @param type - Type de message système
 */
export function getSystemMessage(type: 'welcome' | 'help' | 'error'): string {
  const messages: Record<string, string> = {
    welcome: '👋 Bonjour ! Je suis votre assistant. Comment puis-je vous aider aujourd\'hui ?',
    help: '💡 Je peux vous aider à :\n- Rechercher des services\n- Faire des réservations\n- Annuler des réservations\n- Obtenir de l\'aide',
    error: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer.',
  };
  
  return messages[type];
}

/**
 * Sauvegarde la conversation dans localStorage
 * @param sessionId - ID de session
 * @param messages - Messages de la conversation
 */
export function saveConversation(sessionId: string, messages: any[]): void {
  try {
    const key = `chat_session_${sessionId}`;
    localStorage.setItem(key, JSON.stringify({
      sessionId,
      messages,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Save conversation error:', error);
  }
}

/**
 * Récupère la conversation sauvegardée
 * @param sessionId - ID de session
 */
export function loadConversation(sessionId: string): any[] {
  try {
    const key = `chat_session_${sessionId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      // Ne charger que les conversations de moins de 24h
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data.messages;
      }
    }
    return [];
  } catch (error) {
    console.error('Load conversation error:', error);
    return [];
  }
}