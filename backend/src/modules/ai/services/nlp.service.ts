// src/modules/ai/services/nlp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntentResponseDto } from '../dto/ai.dto';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  private readonly intentPatterns: Map<string, RegExp[]> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeIntentPatterns();
  }

  private initializeIntentPatterns() {
    this.intentPatterns.set('search', [
      /cherche?/i,
      /trouve?/i,
      /recherche?/i,
      /où se trouve?/i,
      /pr[èê]t de/i,
      /proche/i,
      /near/i,
      /find/i,
      /search/i,
    ]);

    this.intentPatterns.set('booking', [
      /r[eé]serve?/i,
      /book/i,
      /prendre rdv/i,
      /prendre rendez[- ]vous/i,
      /r[eé]servation/i,
      /commander/i,
      /order/i,
    ]);

    this.intentPatterns.set('cancel', [
      /annule?/i,
      /cancel/i,
      /supprime?/i,
      /remove/i,
      /annulation/i,
    ]);

    this.intentPatterns.set('help', [
      /aide/i,
      /help/i,
      /commande/i,
      /que faire/i,
      /comment/i,
      /how to/i,
      /quels sont/i,
    ]);

    this.intentPatterns.set('greeting', [
      /^bonjour/i,
      /^salut/i,
      /^coucou/i,
      /^hello/i,
      /^hi/i,
    ]);

    this.intentPatterns.set('feedback', [
      /avis/i,
      /note/i,
      /étoile/i,
      /recommande?/i,
      /feedback/i,
    ]);
  }

  async analyzeIntent(text: string): Promise<IntentResponseDto> {
    const lowerText = text.toLowerCase();
    let bestIntent = 'unknown';
    let bestConfidence = 0;

    for (const [intent, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(lowerText)) {
          const confidence = this.calculateConfidence(lowerText, pattern);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestIntent = intent;
          }
        }
      }
    }

    const entities = await this.extractEntities(text);
    const sentiment = this.analyzeSentiment(text);

    return {
      intent: bestIntent,
      confidence: bestConfidence,
      entities,
      sentiment,
    };
  }

  private calculateConfidence(text: string, pattern: RegExp): number {
    const match = text.match(pattern);
    if (!match) return 0;
    
    const matchLength = match[0].length;
    const textLength = text.length;
    let confidence = matchLength / textLength;
    
    return Math.min(0.9, Math.max(0.3, confidence));
  }

  async extractEntities(text: string): Promise<any> {
    const entities: any = {};

    const categories = {
      restaurant: ['restaurant', 'café', 'bistro', 'brasserie', 'pizzeria'],
      hotel: ['hôtel', 'hotel', 'auberge', 'résidence', 'lodging'],
      spa: ['spa', 'massage', 'bien-être', 'wellness', 'hammam'],
      gym: ['gym', 'salle de sport', 'fitness', 'musculation', 'yoga'],
      salon: ['coiffeur', 'salon', 'beauté', 'beauty', 'barbier'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword)) {
          entities.category = category;
          break;
        }
      }
    }

    const pricePattern = /(\d+)\s*(?:dt|dinar|tnd)?/i;
    const priceMatch = text.match(pricePattern);
    if (priceMatch) {
      entities.price = parseInt(priceMatch[1], 10);
    }

    const datePatterns = [
      /(?:le|ce)\s+(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(?:demain|aujourd'hui|ce soir|ce midi)/,
      /(\d{1,2})\s*(?:h|heure)(?:\s*(\d{2}))?/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.timeReference = match[0];
        break;
      }
    }

    const locationPatterns = [
      /(?:à|a|au|aux|chez)\s+([A-Za-z\s]+)(?:\s|$)/,
      /pr[èê]s de\s+([A-Za-z\s]+)/,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        entities.locationName = match[1].trim();
        break;
      }
    }

    const peoplePattern = /(\d+)\s*(?:personnes?|gens?|pax)/i;
    const peopleMatch = text.match(peoplePattern);
    if (peopleMatch) {
      entities.guests = parseInt(peopleMatch[1], 10);
    }

    return entities;
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bon', 'super', 'excellent', 'génial', 'parfait', 'bien', 'aimer', 'content', 'satisfait', 'merci'];
    const negativeWords = ['mauvais', 'terrible', 'horrible', 'déçu', 'problème', 'erreur', 'pas bien', 'insatisfait', 'dommage'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  async generateResponse(intent: string, entities: any, context?: any): Promise<string> {
    const responses = {
      search: this.generateSearchResponse(entities),
      booking: this.generateBookingResponse(entities),
      cancel: this.generateCancelResponse(context),
      help: this.generateHelpResponse(),
      greeting: this.generateGreetingResponse(),
      feedback: this.generateFeedbackResponse(),
    };

    return responses[intent] || responses.help;
  }

  private generateSearchResponse(entities: any): string {
    let response = 'Je cherche ';
    if (entities.category) response += `des ${entities.category}s `;
    if (entities.locationName) response += `près de ${entities.locationName} `;
    if (entities.price) response += `avec un budget de ${entities.price} DT `;
    response += 'pour vous. Voici ce que j\'ai trouvé :';
    return response;
  }

  private generateBookingResponse(entities: any): string {
    let response = 'Je peux vous aider à réserver. ';
    if (entities.category) response += `Pour un ${entities.category}, `;
    if (entities.guests) response += `pour ${entities.guests} personnes, `;
    response += 'quand souhaitez-vous venir ?';
    return response;
  }

  private generateCancelResponse(context?: any): string {
    if (context?.hasReservations) {
      return 'Voici vos réservations actives. Laquelle souhaitez-vous annuler ?';
    }
    return 'Vous n\'avez pas de réservation active à annuler.';
  }

  private generateHelpResponse(): string {
    return "🤖 **Commandes disponibles:**\n\n" +
      "🔍 **Recherche** : \"Trouve un restaurant près de moi\"\n" +
      "📅 **Réservation** : \"Je veux réserver un hôtel pour 2 personnes\"\n" +
      "❌ **Annulation** : \"Annuler ma réservation\"\n" +
      "⭐ **Avis** : \"Donner mon avis sur un service\"\n\n" +
      "Comment puis-je vous aider aujourd'hui ?";
  }

  private generateGreetingResponse(): string {
    const greetings = [
      "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      "Salut ! Qu'est-ce que je peux faire pour vous ?",
      "Bonjour et bienvenue ! Je suis votre assistant. Que recherchez-vous ?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private generateFeedbackResponse(): string {
    return "Merci de partager votre avis ! Pour quel service souhaitez-vous laisser un commentaire ?";
  }
}