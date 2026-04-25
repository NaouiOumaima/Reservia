// frontend/lib/api/chatbot/types.ts

/**
 * Types pour l'API Chatbot
 */

// Location
export interface Location {
  lat: number;
  lng: number;
}

// Requête de chat
export interface ChatRequest {
  query: string;
  userId?: string;
  location?: Location;
  sessionId?: string;
  language?: 'fr' | 'en' | 'ar';
}

// Réponse du chat
// frontend/lib/api/chatbot/types.ts

// Réponse du chat - AJOUTER sessionId
export interface ChatResponse {
  reply: string;
  intent: 'search' | 'booking' | 'cancel' | 'help' | 'unknown' | 'error' | 'rate_limited';
  entities: any;
  suggestedActions?: string[];
  data?: any;
  sessionId?: string;  // 🆕 Ajouter cette ligne
}

// Types pour Speech-to-Text
export interface SpeechToTextRequest {
  audio: File | Blob;
  language?: 'fr-FR' | 'en-US' | 'ar-SA';
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
  success: boolean;
}

// Types pour Text-to-Speech
export interface TextToSpeechRequest {
  text: string;
  lang?: 'fr-FR' | 'en-US' | 'ar-SA';
  gender?: 'MALE' | 'FEMALE';
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

// Types pour Recommandations
export interface RecommendationsRequest {
  userId: string;
  limit?: number;
}

export interface Recommendation {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  personalized: {
    alreadyBooked: boolean;
    recommendationScore: number;
    matchReason: string;
  };
}

export interface RecommendationsResponse extends Array<Recommendation> {}

// Streaming response
export interface StreamingChunk {
  text: string;
  done: boolean;
}