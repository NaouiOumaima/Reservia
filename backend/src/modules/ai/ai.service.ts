// src/modules/ai/ai.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../database/schemas/reservation.schema';
import { ChatbotRequestDto, ChatbotResponseDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
  ) {}

  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    const { query, userId, location } = request;
    const lowerQuery = query.toLowerCase();

    if (this.isSearchIntent(lowerQuery)) {
      return this.handleSearchIntent(lowerQuery, location);
    }

    if (this.isBookingIntent(lowerQuery)) {
      return this.handleBookingIntent(lowerQuery, userId);
    }

    if (this.isCancelIntent(lowerQuery)) {
      return this.handleCancelIntent(lowerQuery, userId);
    }

    if (this.isHelpIntent(lowerQuery)) {
      return this.handleHelpIntent();
    }

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

  private async handleSearchIntent(query: string, location?: { lat: number; lng: number }): Promise<ChatbotResponseDto> {
    const entities = this.extractEntities(query);

    const searchQuery: any = { isActive: true };

    if (entities.category) {
      searchQuery.category = entities.category;
    }

    if (entities.maxPrice) {
      searchQuery.basePrice = { $lte: entities.maxPrice };
    }

    let services: any[] = [];

    if (location) {
      // @ts-ignore - Ignorer l'erreur de typage MongoDB
      services = await this.serviceModel
        .find({
          ...searchQuery,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
              $maxDistance: (entities.radius || 10) * 1000,
            },
          },
        })
        .limit(5)
        .exec();
    } else {
      services = await this.serviceModel.find(searchQuery as any).limit(5).exec();
    }

    if (services.length === 0) {
      return {
        reply: "Désolé, je n'ai trouvé aucun service correspondant à votre recherche. Voulez-vous élargir vos critères ?",
        intent: 'search',
        entities,
      };
    }

    const reply = this.formatSearchResults(services);
    return { reply, intent: 'search', entities };
  }

  private async handleBookingIntent(query: string, userId?: string): Promise<ChatbotResponseDto> {
    if (!userId) {
      return {
        reply: "Veuillez vous connecter pour faire une réservation.",
        intent: 'booking',
        entities: {},
      };
    }

    return {
      reply: "Je peux vous aider à réserver. Pour commencer, quel type de service recherchez-vous ? (restaurant, hôtel, salon, etc.)",
      intent: 'booking',
      entities: {},
    };
  }

  private async handleCancelIntent(query: string, userId?: string): Promise<ChatbotResponseDto> {
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

    return {
      reply: `Voici vos réservations actives :\n${reservationsList}\n\nPour annuler, dites-moi le numéro de la réservation.`,
      intent: 'cancel',
      entities: { reservations: userReservations },
    };
  }

  private handleHelpIntent(): ChatbotResponseDto {
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

  private extractEntities(query: string): any {
    const entities: any = {};

    const categories = ['restaurant', 'hôtel', 'hotel', 'salle de sport', 'gym', 'coiffeur', 'salon', 'spa'];
    for (const cat of categories) {
      if (query.includes(cat)) {
        entities.category = cat === 'hôtel' ? 'hotel' : cat;
        break;
      }
    }

    const priceMatch = query.match(/(pas cher|moins de|max|maximum)\s*(\d+)/i);
    if (priceMatch) {
      entities.maxPrice = parseInt(priceMatch[2], 10);
    }

    const radiusMatch = query.match(/(\d+)\s*(km|kilomètres)/i);
    if (radiusMatch) {
      entities.radius = parseInt(radiusMatch[1], 10);
    }

    return entities;
  }

  private formatSearchResults(services: ServiceDocument[]): string {
    if (services.length === 0) return "Aucun résultat trouvé.";

    let reply = "🎯 **Voici ce que j'ai trouvé :**\n\n";
    services.forEach((service, index) => {
      reply += `${index + 1}. **${service.name}**\n`;
      reply += `   📍 ${service.location.address}\n`;
      reply += `   ⭐ ${service.avgRating}/5 (${service.reviewCount} avis)\n`;
      reply += `   💰 ${service.basePrice} DT\n`;
      reply += `   🕐 ${service.duration} min\n\n`;
    });

    reply += "Souhaitez-vous plus de détails ou réserver l'un de ces services ?";
    return reply;
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    const userReservations = await this.reservationModel
      .find({ clientId: new Types.ObjectId(userId), status: 'completed' })
      .populate('serviceId')
      .limit(10)
      .exec();

    const userCategories = new Set();
    let userMaxPrice = 0;
    let userAvgPrice = 0;

    for (const res of userReservations) {
      const service = res.serviceId as any;
      if (service) {
        userCategories.add(service.category);
        if (service.basePrice > userMaxPrice) userMaxPrice = service.basePrice;
        userAvgPrice += service.basePrice;
      }
    }

    if (userCategories.size === 0) {
      return this.serviceModel.find({ isActive: true } as any).sort({ popularity: -1 }).limit(limit).exec();
    }

    userAvgPrice = userAvgPrice / (userReservations.length || 1);

    // @ts-ignore - Ignorer les erreurs de typage MongoDB
    return this.serviceModel
      .find({
        isActive: true,
        category: { $in: Array.from(userCategories) },
        basePrice: { $lte: userMaxPrice + 50, $gte: userAvgPrice - 50 },
      } as any)
      .sort({ smartScore: -1 })
      .limit(limit)
      .exec();
  }
}