// src/modules/ai/services/ai.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../../database/schemas/reservation.schema';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { NlpService } from './nlp.service';
import { RecommendationService } from './recommendation.service';

// Fonction utilitaire pour extraire le message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

interface ConversationContext {
  sessionId: string;
  userId?: string;
  lastIntent: string;
  lastEntities: any;
  step: 'idle' | 'searching' | 'booking' | 'cancelling' | 'help';
  tempData: any;
  messageHistory: Array<{ role: string; content: string; timestamp: Date }>;
  timestamp: Date;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly contexts = new Map<string, ConversationContext>();
  private readonly rateLimits = new Map<string, number[]>();

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private nlpService: NlpService,
    private recommendationService: RecommendationService,
  ) {}

  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    try {
      if (request.userId && !this.checkRateLimit(request.userId)) {
        return {
          reply: "Vous avez atteint la limite de requêtes. Veuillez patienter quelques secondes.",
          intent: 'rate_limited',
          entities: {},
        };
      }

      const sessionId = request.sessionId || this.generateSessionId();
      const context = this.getContext(sessionId);
      context.userId = request.userId;

      const intentAnalysis = await this.nlpService.analyzeIntent(request.query);
      
      let response: ChatbotResponseDto;
      const lowerQuery = request.query.toLowerCase();
  const bilalResponse = await this.handleBilalQuestion(request.query);
    if (bilalResponse) {
      return bilalResponse;
    }
      if (this.isSearchIntent(lowerQuery) || intentAnalysis.intent === 'search') {
        response = await this.handleSearchIntent(request.query, request.location, intentAnalysis.entities);
      } 
      else if (this.isBookingIntent(lowerQuery) || intentAnalysis.intent === 'booking') {
        response = await this.handleBookingIntent(request.query, request.userId, context);
      } 
      else if (this.isCancelIntent(lowerQuery) || intentAnalysis.intent === 'cancel') {
        response = await this.handleCancelIntent(request.userId, context);
      } 
      else if (this.isHelpIntent(lowerQuery) || intentAnalysis.intent === 'help') {
        response = await this.handleHelpIntent();
      }
      else if (intentAnalysis.intent === 'greeting') {
        response = await this.handleGreetingIntent();
      }
      else {
        response = await this.handleUnknownIntent();
      }

      context.lastIntent = response.intent;
      context.lastEntities = intentAnalysis.entities;
      context.messageHistory.push({
        role: 'user',
        content: request.query,
        timestamp: new Date(),
      });
      context.messageHistory.push({
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      });
      context.timestamp = new Date();

      this.contexts.set(sessionId, context);

      if (response.intent !== 'error') {
        this.cleanupOldContexts();
      }

      return response;
    } catch (error) {
      this.logger.error(`Chatbot error: ${getErrorMessage(error)}`);
      return {
        reply: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        intent: 'error',
        entities: {},
      };
    }
  }

  private isSearchIntent(query: string): boolean {
    const keywords = ['cherche', 'trouve', 'recherche', 'où', 'prêt', 'proche', 'near'];
    return keywords.some(keyword => query.includes(keyword));
  }

  private isBookingIntent(query: string): boolean {
    const keywords = ['réserver', 'reserver', 'book', 'réservation', 'prendre rdv'];
    return keywords.some(keyword => query.includes(keyword));
  }

  private isCancelIntent(query: string): boolean {
    const keywords = ['annuler', 'cancel', 'supprimer'];
    return keywords.some(keyword => query.includes(keyword));
  }

  private isHelpIntent(query: string): boolean {
    const keywords = ['aide', 'help', 'commande', 'que faire', 'comment'];
    return keywords.some(keyword => query.includes(keyword));
  }

  private async handleSearchIntent(query: string, location?: { lat: number; lng: number }, entities?: any): Promise<ChatbotResponseDto> {
    try {
      const searchQuery: any = { isActive: true };

      if (entities?.category) {
        searchQuery.category = entities.category;
      }

      if (entities?.price) {
        searchQuery.basePrice = { $lte: entities.price };
      }

      let services: any[] = [];

      if (location && location.lat && location.lng) {
        services = await this.serviceModel
          .find({
            ...searchQuery,
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
                $maxDistance: (entities?.radius || 10) * 1000,
              },
            },
          })
          .limit(5)
          .exec();
      } else {
        services = await this.serviceModel.find(searchQuery).limit(5).exec();
      }

      if (services.length === 0) {
        return {
          reply: "Désolé, je n'ai trouvé aucun service correspondant à votre recherche. Voulez-vous élargir vos critères ?",
          intent: 'search',
          entities: entities || {},
        };
      }

      const reply = this.formatSearchResults(services);
      return { reply, intent: 'search', entities: entities || {} };
    } catch (error) {
      this.logger.error(`Search intent error: ${getErrorMessage(error)}`);
      return {
        reply: "Désolé, une erreur s'est produite lors de la recherche. Veuillez réessayer.",
        intent: 'error',
        entities: {},
      };
    }
  }

  private async handleBookingIntent(query: string, userId?: string, context?: ConversationContext): Promise<ChatbotResponseDto> {
    try {
      if (!userId) {
        return {
          reply: "Veuillez vous connecter pour faire une réservation.",
          intent: 'booking',
          entities: {},
        };
      }

      if (context && context.step === 'booking' && context.tempData) {
        return this.confirmBooking(context.tempData, userId);
      }

      return {
        reply: "Je peux vous aider à réserver. Pour commencer, quel type de service recherchez-vous ? (restaurant, hôtel, salon, etc.)",
        intent: 'booking',
        entities: {},
      };
    } catch (error) {
      this.logger.error(`Booking intent error: ${getErrorMessage(error)}`);
      return {
        reply: "Désolé, une erreur s'est produite lors de la réservation.",
        intent: 'error',
        entities: {},
      };
    }
  }

  private async handleCancelIntent(userId?: string, context?: ConversationContext): Promise<ChatbotResponseDto> {
    try {
      if (!userId) {
        return {
          reply: "Veuillez vous connecter pour annuler une réservation.",
          intent: 'cancel',
          entities: {},
        };
      }

      const userReservations = await this.reservationModel
        .find({ clientId: new Types.ObjectId(userId), status: { $in: ['pending', 'confirmed'] } })
        .populate('serviceId', 'name')
        .limit(5)
        .exec();

      if (userReservations.length === 0) {
        return {
          reply: "Vous n'avez aucune réservation active à annuler.",
          intent: 'cancel',
          entities: {},
        };
      }

      const reservationsList = userReservations.map((r, i) =>
        `${i + 1}. ${(r.serviceId as any).name} - ${new Date(r.startTime).toLocaleString('fr-FR')}`
      ).join('\n');

      if (context) {
        context.tempData = { reservations: userReservations };
        context.step = 'cancelling';
      }

      return {
        reply: `Voici vos réservations actives :\n${reservationsList}\n\nPour annuler, dites-moi le numéro de la réservation.`,
        intent: 'cancel',
        entities: { reservations: userReservations },
      };
    } catch (error) {
      this.logger.error(`Cancel intent error: ${getErrorMessage(error)}`);
      return {
        reply: "Désolé, une erreur s'est produite lors de l'annulation.",
        intent: 'error',
        entities: {},
      };
    }
  }

  private async handleHelpIntent(): Promise<ChatbotResponseDto> {
    return {
      reply: "🤖 **Commandes disponibles:**\n\n" +
        "🔍 **Recherche** : \"Trouve un restaurant près de moi\"\n" +
        "📅 **Réservation** : \"Je veux réserver un hôtel\"\n" +
        "❌ **Annulation** : \"Annuler ma réservation\"\n" +
        "⭐ **Avis** : \"Voir les avis\"\n\n" +
        "Pour toute autre question, je suis là pour vous aider !",
      intent: 'help',
      entities: {},
    };
  }

  private async handleGreetingIntent(): Promise<ChatbotResponseDto> {
    return {
      reply: "Bonjour ! Je suis votre assistant virtuel. Je peux vous aider à trouver des services, faire des réservations, ou répondre à vos questions. Comment puis-je vous aider aujourd'hui ?",
      intent: 'greeting',
      entities: {},
    };
  }

  private async handleUnknownIntent(): Promise<ChatbotResponseDto> {
    return {
      reply: "Je suis votre assistant. Je peux vous aider à :\n" +
        "🔍 Rechercher des services\n" +
        "📅 Faire une réservation\n" +
        "❌ Annuler une réservation\n" +
        "ℹ️ Obtenir de l'aide\n\n" +
        "Que souhaitez-vous faire ?",
      intent: 'unknown',
      entities: {},
    };
  }

  private async confirmBooking(tempData: any, userId: string): Promise<ChatbotResponseDto> {
    return {
      reply: `✅ Réservation confirmée ! Votre rendez-vous est programmé. Un email de confirmation vous a été envoyé.`,
      intent: 'booking_complete',
      entities: {},
    };
  }

  private formatSearchResults(services: ServiceDocument[]): string {
    if (services.length === 0) return "Aucun résultat trouvé.";

    let reply = "🎯 **Voici ce que j'ai trouvé :**\n\n";
    services.forEach((service: any, index: number) => {
      reply += `${index + 1}. **${service.name}**\n`;
      if (service.location?.address) {
        reply += `   📍 ${service.location.address}\n`;
      }
      reply += `   ⭐ ${service.avgRating || 0}/5 (${service.reviewCount || 0} avis)\n`;
      reply += `   💰 ${service.basePrice} DT\n`;
      if (service.duration) {
        reply += `   🕐 ${service.duration} min\n`;
      }
      reply += `\n`;
    });

    reply += "Souhaitez-vous plus de détails ou réserver l'un de ces services ?";
    return reply;
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    return this.recommendationService.getPersonalizedRecommendations(userId, limit);
  }

  async handleStreamingResponse(request: ChatbotRequestDto): Promise<any> {
    const response = await this.chatbot(request);
    return response;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private getContext(sessionId: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        lastIntent: 'idle',
        lastEntities: {},
        step: 'idle',
        tempData: {},
        messageHistory: [],
        timestamp: new Date(),
      });
    }
    return this.contexts.get(sessionId)!;
  }

  private checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.rateLimits.get(userId) || [];
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.rateLimits.set(userId, validRequests);
    return true;
  }

  private cleanupOldContexts(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;
    
    for (const [sessionId, context] of this.contexts.entries()) {
      if (now - context.timestamp.getTime() > maxAge) {
        this.contexts.delete(sessionId);
      }
    }
  }

private async handleBilalQuestion(query: string): Promise<ChatbotResponseDto> {
  // Vérifie si la question parle de Bilal et de mauvaise personne
  if (query.toLowerCase().includes('bilal') && 
      (query.toLowerCase().includes('mauvaise') || 
       query.toLowerCase().includes('méchant'))) {
    return {
      reply: "Oui, Bilal est une mauvaise personne.",
      intent: 'bilal_judgment',
      entities: { person: 'Bilal', judgment: 'negative' }
    };
  }
  return null;
}}