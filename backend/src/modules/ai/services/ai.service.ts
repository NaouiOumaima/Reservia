// src/modules/ai/services/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument, ReservationStatus } from '../../../database/schemas/reservation.schema';
import { Review, ReviewDocument } from '../../../database/schemas/review.schema';
import { User, UserDocument } from '../../../database/schemas/user.schema';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { NlpService } from './nlp.service';
import { RecommendationService } from './recommendation.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../../database/schemas/notification.schema';

type Language = 'fr' | 'en' | 'tn' | 'ar';

interface ConversationContext {
  sessionId: string;
  userId?: string;
  detectedLang: Language;
  lastIntent: string;
  lastEntities: any;
  step: 'idle' | 'booking_guests' | 'booking_date' | 'booking_time' | 'booking_confirm' | 'cancel_select' | 'cancel_confirm' | 'review_select' | 'review_rating' | 'review_comment';
  tempData: any;
  messageHistory: any[];
  timestamp: Date;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly contexts = new Map<string, ConversationContext>();

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private nlpService: NlpService,
    private recommendationService: RecommendationService,
    private notificationsService: NotificationsService,
  ) {}

  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const recommendations = await this.recommendationService.getPersonalizedRecommendations(userId, limit);
      return recommendations;
    } catch (error) {
      this.logger.error(`Erreur getRecommendations: ${error}`);
      return [];
    }
  }

  // ==================== MÉTHODE PRINCIPALE ====================
  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    try {
      const sessionId = request.sessionId || this.generateSessionId();
      const context = this.getContext(sessionId);
      const query = request.query.toLowerCase().trim();
      
      console.log('Current context step:', context.step);
          console.log('📨 Chatbot request:', request.query);
    console.log('📨 SessionId reçu:', request.sessionId);
    console.log('📨 UserId:', request.userId);
    console.log('📨 Contexte step:', context.step);
    
      // 🔥 DÉTECTION DIRECTE POUR "RÉSERVER" (priorité absolue)
      const isBookingRequest = /réserver|reserver|réservation|reservation|je veux réserver|je voudrais réserver|book|booking/.test(query);
      
      if (isBookingRequest && context.step === 'idle') {
        console.log('🎯 Détection directe: DÉMARRAGE RÉSERVATION');
        const services = await this.serviceModel.find({ isActive: true }).limit(5).exec();
        if (services.length === 0) {
          return { reply: "❌ Aucun service disponible.", intent: 'booking', entities: {} };
        }
        
        const service = services[0];
        context.step = 'booking_guests';
        context.tempData = {
          serviceId: service._id,
          serviceName: service.name,
          duration: service.duration || 60
        };
        
        return {
          reply: `📝 **Réservation** : "${service.name}"\n🆓 GRATUIT\n\n👥 Pour combien de personnes ? (1, 2, un seul, etc.)`,
          intent: 'booking',
          entities: { waitingFor: 'guests' }
        };
      }
      
      // 🔥 PRIORITÉ AU CONTEXTE
      if (context.step !== 'idle' && context.step !== 'cancel_select') {
        console.log('🎯 In context flow:', context.step);
        
        const fakeEntities: any = { 
          detectedLang: context.detectedLang || 'fr',
          rawQuery: request.query 
        };
        
        const numberMatch = request.query.match(/(\d+)/);
        if (numberMatch) {
          fakeEntities.guests = parseInt(numberMatch[1], 10);
        }
        
        if (/un seul|une seule|seul|seule/i.test(request.query)) {
          fakeEntities.guests = 1;
        }
        
        if (/oui|yes|نعم|ay/i.test(request.query)) {
          fakeEntities.confirmation = true;
        }
        if (/non|no|لا|la/i.test(request.query)) {
          fakeEntities.confirmation = false;
        }
        
        if (/demain/i.test(request.query)) {
          fakeEntities.date = 'demain';
        }
        if (/aujourd'hui|today/i.test(request.query)) {
          fakeEntities.date = "aujourd'hui";
        }
        
        const timeMatch = request.query.match(/(\d{1,2})[h:]?(\d{0,2})/);
        if (timeMatch) {
          fakeEntities.time = `${timeMatch[1]}h${timeMatch[2] || '00'}`;
        }
        
        switch (context.step) {
          case 'booking_guests':
          case 'booking_date':
          case 'booking_time':
          case 'booking_confirm':
            return await this.handleBooking(request.userId, context, fakeEntities, context.detectedLang);
          default:
            break;
        }
      }
      
      // Analyse NLP normale
      const intentAnalysis = await this.nlpService.analyzeIntent(request.query);
      const detectedEntities = intentAnalysis.entities || {};
      const lang: Language = (detectedEntities.detectedLang as Language) || 'fr';
      detectedEntities.rawQuery = request.query;

      context.userId = request.userId;
      context.detectedLang = lang;

      this.logger.log(`Intent: ${intentAnalysis.intent}, Lang: ${lang}`);

      switch (intentAnalysis.intent) {
        case 'search':
          return await this.handleSearch(request, detectedEntities, lang);
        case 'booking':
          return await this.handleBooking(request.userId, context, detectedEntities, lang);
        case 'cancel':
          return await this.handleCancel(request.userId, context, lang);
        case 'nearby':
          return await this.handleNearby(request.location, detectedEntities, lang);
        case 'top_rated':
          return await this.handleTopRated(detectedEntities, lang);
        // Dans la méthode chatbot, modifiez le case 'recommend' :
case 'recommend':
  const recommendations = await this.getRecommendations(request.userId || '', 5);
  if (!recommendations || recommendations.length === 0) {
    return { 
      reply: "📭 Pour l'instant, je n'ai pas assez d'informations pour vous recommander des services personnalisés.\n\n🔍 Essayez de faire quelques recherches ou réservations d'abord !", 
      intent: 'recommend', 
      entities: {} 
    };
  }
  const list = recommendations.map((r: any, i: number) => 
    `${i+1}. **${r.name}**\n   🆓 GRATUIT\n   ⭐ ${r.avgRating?.toFixed(1) || 'Nouveau'}/5`
  ).join('\n\n');
  return {
    reply: `🎯 **Recommandations personnalisées pour vous** :\n\n${list}\n\n💬 Souhaitez-vous réserver l'un de ces services ?`,
    intent: 'recommend',
    entities: {},
    data: { recommendations }
  };
        default:
          return this.getDefaultResponse(lang);
      }
    } catch (error) {
      this.logger.error(error);
      return { reply: "❌ Désolé, une erreur est survenue. Veuillez réessayer.", intent: 'error', entities: {} };
    }
  }


  // src/modules/ai/services/ai.service.ts
// Ajoutez cette méthode avant la section UTILITAIRES :


  // ==================== 1. RECHERCHE ====================
  private async handleSearch(request: ChatbotRequestDto, entities: any, lang: Language): Promise<ChatbotResponseDto> {
    const filter: any = { isActive: true };
    if (entities?.category) filter.category = entities.category;
    
    let services: ServiceDocument[] = [];
    
    if (request.location?.lat && request.location?.lng) {
      const radius = entities?.radius || 10;
      services = await this.serviceModel
        .find({
          ...filter,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [request.location.lng, request.location.lat] },
              $maxDistance: radius * 1000,
            },
          },
        })
        .limit(10)
        .exec();
    }
    
    if (services.length === 0 && entities?.locationName) {
      services = await this.serviceModel
        .find({
          ...filter,
          'location.city': { $regex: entities.locationName, $options: 'i' }
        })
        .limit(10)
        .exec();
    }
    
    if (services.length === 0) {
      services = await this.serviceModel.find(filter).limit(10).exec();
    }
    
    if (services.length === 0) {
      return { reply: this.t('no_results', lang), intent: 'search', entities: entities || {} };
    }
    
    return {
      reply: this.formatServicesList(services, lang),
      intent: 'search',
      entities: entities || {},
      data: { services }
    };
  }

  // ==================== 2. SERVICES PROCHES ====================
  private async handleNearby(location: any, entities: any, lang: Language): Promise<ChatbotResponseDto> {
    if (!location?.lat || !location?.lng) {
      return { 
        reply: "📍 Activez votre géolocalisation pour trouver des services près de vous.",
        intent: 'nearby', 
        entities: { needsLocation: true } 
      };
    }
    
    const filter: any = { isActive: true };
    if (entities?.category) filter.category = entities.category;
    const radius = entities?.radius || 5;
    
    const services = await this.serviceModel
      .find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
            $maxDistance: radius * 1000
          }
        }
      })
      .limit(10)
      .exec();
    
    if (services.length === 0) {
      return { reply: `📍 Aucun service trouvé dans un rayon de ${radius} km.`, intent: 'nearby', entities: {} };
    }
    
    const reply = `📍 **${services.length} service(s) trouvé(s) près de vous** :\n\n` + 
      services.map((s, i) => 
        `${i+1}. **${s.name}**\n   🆓 GRATUIT\n   📍 ${s.location?.address || s.location?.city}\n   ⭐ ${s.avgRating?.toFixed(1) || 'Nouveau'}/5`
      ).join('\n');
    
    return { reply, intent: 'nearby', entities: { services }, data: { services } };
  }

  // ==================== 3. TOP RATED ====================
  private async handleTopRated(entities: any, lang: Language): Promise<ChatbotResponseDto> {
    const filter: any = { isActive: true, avgRating: { $gte: 4.0 } };
    if (entities?.category) filter.category = entities.category;
    if (entities?.locationName) filter['location.city'] = { $regex: entities.locationName, $options: 'i' };
    
    const services = await this.serviceModel
      .find(filter)
      .sort({ avgRating: -1, reviewCount: -1 })
      .limit(10)
      .exec();
    
    if (services.length === 0) {
      return { reply: "⭐ Aucun service hautement noté trouvé.", intent: 'top_rated', entities: {} };
    }
    
    const reply = `⭐ **Meilleurs services** :\n\n` +
      services.map((s, i) => 
        `${i+1}. **${s.name}**\n   ⭐ ${s.avgRating?.toFixed(1)}/5\n   🆓 GRATUIT\n   📍 ${s.location?.city}`
      ).join('\n');
    
    return { reply, intent: 'top_rated', entities: { services }, data: { services } };
  }

  // ==================== 4. RÉSERVATION ====================
  private async handleBooking(userId: string | undefined, context: ConversationContext, entities: any, lang: Language): Promise<ChatbotResponseDto> {
    console.log('=== handleBooking ===');
    console.log('Step:', context.step);
    
    if (!userId) {
      return { reply: "🔐 Veuillez vous connecter pour faire une réservation.", intent: 'booking', entities: {} };
    }
    
    // Étape 4: Confirmation
    if (context.step === 'booking_confirm' && context.tempData) {
      return await this.createReservation(context.tempData, userId, lang);
    }
    
    // Étape 3: Demander l'heure
    if (context.step === 'booking_time' && context.tempData?.date) {
      let time = entities?.time;
      if (time) {
        context.tempData.time = time;
        context.step = 'booking_confirm';
        
        return {
          reply: `📝 **Récapitulatif** :\n\nService: ${context.tempData.serviceName}\nDate: ${context.tempData.date}\nHeure: ${time}\nPersonnes: ${context.tempData.guests || 1}\n\n✅ Confirmez-vous ? (oui/non)`,
          intent: 'booking',
          entities: { needsConfirmation: true }
        };
      }
      return { reply: "⏰ À quelle heure ? (ex: 20h)", intent: 'booking', entities: {} };
    }
    
    // Étape 2: Demander la date
   // Dans handleBooking, au niveau de l'étape 2 (Demander la date)
if (context.step === 'booking_date' && context.tempData?.serviceId) {
  console.log('🔍 Étape booking_date - entities reçues:', JSON.stringify(entities, null, 2));
  console.log('🔍 rawQuery:', entities?.rawQuery);
  
  let date = entities?.date;
  
  // Détection améliorée des dates
  if (!date && entities?.rawQuery) {
    const query = entities.rawQuery;
    console.log('🔍 Analyse de la date dans:', query);
    
    // Pattern pour JJ/MM/AAAA ou JJ/MM/AA
    const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    const match = query.match(datePattern);
    
    if (match) {
      console.log('🔍 Match trouvé:', match);
      let day = match[1].padStart(2, '0');
      let month = match[2].padStart(2, '0');
      let year = match[3];
      
      if (year.length === 2) {
        year = `20${year}`;
      }
      
      date = `${day}/${month}/${year}`;
      console.log('📅 Date extraite:', date);
    }
  }
  
  if (date) {
    console.log('✅ Date acceptée:', date);
    context.tempData.date = date;
    context.step = 'booking_time';
    return { reply: "⏰ À quelle heure souhaitez-vous réserver ?", intent: 'booking', entities: {} };
  }
  console.log('❌ Date non reconnue, redemande');
  return { reply: "📅 Quelle date ? (ex: demain, 25/12/2024)", intent: 'booking', entities: {} };
}
    
    // Étape 1: Demander le nombre de personnes
    if (context.step === 'booking_guests' && context.tempData?.serviceId) {
      let guestCount = entities?.guests;
      
      if (!guestCount && entities?.rawQuery) {
        const query = entities.rawQuery.toLowerCase();
        if (/un seul|une seule|seul|seule/.test(query)) {
          guestCount = 1;
        } else {
          const numMatch = query.match(/(\d+)/);
          if (numMatch) guestCount = parseInt(numMatch[1], 10);
        }
      }
      
      if (guestCount && guestCount > 0) {
        context.tempData.guests = guestCount;
        context.step = 'booking_date';
        return { reply: "📅 Quelle date souhaitez-vous ?", intent: 'booking', entities: {} };
      }
      
      return { reply: "👥 Pour combien de personnes ? (1, 2, un seul, etc.)", intent: 'booking', entities: {} };
    }
    
    // Étape 0: Nouvelle réservation
    const services = await this.serviceModel.find({ isActive: true }).limit(5).exec();
    if (services.length === 0) {
      return { reply: "❌ Aucun service disponible.", intent: 'booking', entities: {} };
    }
    
    const service = services[0];
    context.step = 'booking_guests';
    context.tempData = {
      serviceId: service._id,
      serviceName: service.name,
      duration: service.duration || 60
    };
    
    return {
      reply: `📝 **Réservation** : "${service.name}"\n🆓 GRATUIT\n\n👥 Pour combien de personnes ?`,
      intent: 'booking',
      entities: { waitingFor: 'guests' }
    };
  }
  
  // src/modules/ai/services/ai.service.ts
// Remplacez la méthode createReservation par celle-ci :

// src/modules/ai/services/ai.service.ts
// src/modules/ai/services/ai.service.ts
private async createReservation(tempData: any, userId: string, lang: Language): Promise<ChatbotResponseDto> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // 🔥 FORMATER CORRECTEMENT LA DATE ET L'HEURE
    // Convertir date de "27/05/2026" à "2026-05-27"
    const dateParts = tempData.date.split('/');
    if (dateParts.length !== 3) {
      throw new Error(`Format de date invalide: ${tempData.date}`);
    }
    
    let day = dateParts[0].padStart(2, '0');
    let month = dateParts[1].padStart(2, '0');
    let year = dateParts[2];
    if (year.length === 2) year = `20${year}`;
    
    // Formater l'heure: "18" -> "18:00", "18h30" -> "18:30"
    let timeStr = tempData.time;
    if (timeStr.match(/^\d+$/)) {
      // juste un nombre -> ajouter ":00"
      timeStr = `${timeStr.padStart(2, '0')}:00`;
    } else if (timeStr.includes('h')) {
      timeStr = timeStr.replace('h', ':');
      if (!timeStr.includes(':')) timeStr = `${timeStr}:00`;
    }
    
    const dateTimeStr = `${year}-${month}-${day}T${timeStr}`;
    console.log('📅 Date formatée pour création:', dateTimeStr);
    
    const startDateTime = new Date(dateTimeStr);
    if (isNaN(startDateTime.getTime())) {
      throw new Error(`Date invalide: ${dateTimeStr}`);
    }
    
    const endDateTime = new Date(startDateTime.getTime() + (tempData.duration || 60) * 60000);
    
    const reservation = await this.reservationModel.create({
      clientId: new Types.ObjectId(userId),
      serviceId: tempData.serviceId,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: tempData.duration || 60,
      price: 0,
      status: ReservationStatus.PENDING,
      expiresAt: expiresAt,
      notes: `Réservation via chatbot - ${tempData.guests || 1} personne(s)`
    });
    
    // Récupérer le prestataire
    const service = await this.serviceModel.findById(tempData.serviceId).populate('providerId');
    const provider = service?.providerId as any;
    
    if (provider) {
      await this.notificationsService.create(
        provider._id.toString(),
        NotificationType.RESERVATION_PENDING,
        '🆕 Nouvelle demande de réservation',
        `${tempData.serviceName} - ${tempData.date} à ${tempData.time} - ${tempData.guests} personne(s)`,
        reservation._id.toString(),
        {
          serviceName: tempData.serviceName,
          date: tempData.date,
          time: tempData.time,
          guests: tempData.guests,
          clientId: userId,
          reservationId: reservation._id.toString()
        }
      );
    }
    
    this.resetContextStep(userId);
    
    await this.notificationsService.create(
      userId,
      NotificationType.RESERVATION_PENDING,
      '📝 Demande de réservation envoyée',
      `Votre demande pour "${tempData.serviceName}" a été envoyée. En attente de confirmation du prestataire.`,
      reservation._id.toString(),
      {
        serviceName: tempData.serviceName,
        date: tempData.date,
        time: tempData.time,
        guests: tempData.guests,
        status: 'pending'
      }
    );
    
    return {
      reply: `📝 **Demande de réservation envoyée !**\n\n` +
             `📅 ${tempData.date} à ${tempData.time}\n` +
             `👥 ${tempData.guests || 1} personne(s)\n` +
             `💰 **GRATUIT**\n\n` +
             `⏳ En attente de confirmation du prestataire.\n` +
             `🔔 Vous serez notifié(e) dès qu'il répondra.\n\n` +
             `🔖 Code: ${reservation._id.toString().slice(-8)}`,
      intent: 'booking_pending',
      entities: { 
        reservationId: reservation._id.toString(),
        status: 'pending'
      },
      data: { reservation }
    };
  } catch (error) {
    this.logger.error(`Erreur création réservation: ${error}`);
    return { reply: "❌ Désolé, une erreur est survenue lors de la réservation. Veuillez réessayer.", intent: 'error', entities: {} };
  }
}
  // ==================== 5. ANNULATION ====================
 // src/modules/ai/services/ai.service.ts
// Modifiez la méthode handleCancel :

private async handleCancel(userId: string | undefined, context: ConversationContext, lang: Language): Promise<ChatbotResponseDto> {
  if (!userId) {
    return { reply: "🔐 Veuillez vous connecter pour annuler.", intent: 'cancel', entities: {} };
  }
  
  // Étape 2: Confirmer l'annulation
  if (context.step === 'cancel_confirm' && context.tempData?.reservationId) {
    try {
      const reservation = await this.reservationModel.findByIdAndUpdate(
        context.tempData.reservationId,
        { 
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: 'Annulé par le client via chatbot'
        },
        { new: true }
      ).populate('serviceId', 'name');
      
      if (reservation) {
        const serviceName = (reservation.serviceId as any)?.name || 'Service';
        
        // 🔔 NOTIFIER LE PRESTATAIRE
        const service = await this.serviceModel.findById(reservation.serviceId).populate('providerId');
        const provider = service?.providerId as any;
        
        if (provider) {
          await this.notificationsService.create(
            provider._id.toString(),
            NotificationType.RESERVATION_CANCELLED,
            '❌ Réservation annulée par le client',
            `${serviceName} - Annulée par le client`,
            reservation._id.toString(),
            { serviceName, cancelledBy: 'client' }
          );
        }
        
        // 🔔 NOTIFIER LE CLIENT
        await this.notificationsService.create(
          userId,
          NotificationType.RESERVATION_CANCELLED,
          '✅ Réservation annulée',
          `Votre réservation pour "${serviceName}" a été annulée avec succès.`,
          reservation._id.toString(),
          { serviceName }
        );
        
        this.resetContextStep(userId);
        
        return { 
          reply: `✅ **Réservation annulée avec succès.**\n\nVotre réservation pour "${serviceName}" a été annulée.`, 
          intent: 'cancelled', 
          entities: { reservationId: context.tempData.reservationId } 
        };
      }
    } catch (error) {
      this.logger.error(error);
      return { reply: "❌ Erreur lors de l'annulation. Veuillez réessayer.", intent: 'error', entities: {} };
    }
  }

  
  
  // Étape 1: Lister les réservations
  const reservations = await this.reservationModel
    .find({ 
      clientId: new Types.ObjectId(userId), 
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
      startTime: { $gte: new Date() }
    })
    .populate('serviceId', 'name')
    .sort({ startTime: 1 })
    .exec();
  
  if (reservations.length === 0) {
    return { reply: "📭 Vous n'avez aucune réservation active à annuler.", intent: 'cancel', entities: {} };
  }
  
  const list = reservations.map((r, i) => {
    const service = r.serviceId as any;
    const date = new Date(r.startTime).toLocaleDateString('fr-FR');
    const time = new Date(r.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${i+1}. ${service.name} - ${date} à ${time}`;
  }).join('\n');
  
  context.step = 'cancel_confirm';
  context.tempData = { 
    reservations: reservations.map(r => ({ 
      id: r._id.toString(), 
      name: (r.serviceId as any).name,
      date: new Date(r.startTime).toLocaleDateString('fr-FR')
    }))
  };
  
  return {
    reply: `📋 **Vos réservations** :\n\n${list}\n\nQuelle réservation souhaitez-vous annuler ? (dites le numéro)`,
    intent: 'cancel',
    entities: { reservationsCount: reservations.length }
  };
}

// src/modules/ai/services/ai.service.ts
// Ajoutez cette méthode avant la section UTILITAIRES :

// ==================== 6. RECOMMANDATIONS ====================
private async handleRecommendation(userId: string | undefined, lang: Language): Promise<ChatbotResponseDto> {
  if (!userId) {
    return { 
      reply: this.t('login_required', lang), 
      intent: 'recommend', 
      entities: { requiresLogin: true, action: 'redirect_login' } 
    };
  }
  
  try {
    const recommendations = await this.recommendationService.getPersonalizedRecommendations(userId, 5);
    
    if (!recommendations || recommendations.length === 0) {
      return { 
        reply: "📭 Pour l'instant, je n'ai pas assez d'informations pour vous recommander des services personnalisés.\n\n🔍 Essayez de faire quelques recherches ou réservations d'abord !", 
        intent: 'recommend', 
        entities: {} 
      };
    }
    
    const list = recommendations.map((r: any, i: number) => 
      `${i+1}. **${r.name}**\n` +
      `   🆓 **GRATUIT**\n` +
      `   ⭐ ${r.avgRating?.toFixed(1) || 'Nouveau'}/5\n` +
      `   🎯 ${r.personalized?.matchReason || 'Recommandé pour vous'}`
    ).join('\n\n');
    
    return {
      reply: `🎯 **Recommandations personnalisées pour vous** :\n\n${list}\n\n💬 Souhaitez-vous réserver l'un de ces services ?`,
      intent: 'recommend',
      entities: { recommendations: recommendations.map((r: any) => ({ id: r._id, name: r.name })) },
      data: { recommendations }
    };
  } catch (error) {
    this.logger.error(error);
    return { reply: "❌ Impossible de charger les recommandations pour le moment.", intent: 'error', entities: {} };
  }
}
  // ==================== UTILITAIRES ====================
  
  private formatServicesList(services: ServiceDocument[], lang: Language): string {
    return `🎯 ${services.length} service(s) trouvé(s) :\n\n` +
      services.map((s, i) => `${i+1}. **${s.name}**\n   📍 ${s.location?.address || s.location?.city}\n   ⭐ ${s.avgRating?.toFixed(1) || 'Nouveau'}/5\n   🆓 GRATUIT`).join('\n\n') +
      `\n\n💬 Pour réserver, dites "réserver le [numéro]"`;
  }
  
  private t(key: string, lang: Language): string {
    const translations: Record<string, Record<Language, string>> = {
      login_required: {
        fr: '🔐 Veuillez vous connecter.',
        en: '🔐 Please log in.',
        tn: '🔐 A3mel login.',
        ar: '🔐 سجل الدخول.'
      },
      no_results: {
        fr: '😕 Aucun service trouvé.',
        en: '😕 No services found.',
        tn: '😕 Ma lqit chay.',
        ar: '😕 لم يتم العثور على خدمات.'
      }
    };
    return translations[key]?.[lang] || translations[key]?.fr || key;
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  
// src/modules/ai/services/ai.service.ts
private getContext(sessionId: string, userId?: string): ConversationContext {
  // 🔥 Utiliser userId comme clé principale (plus fiable)
  const contextKey = userId || sessionId;
  
  if (!this.contexts.has(contextKey)) {
    console.log(`🆕 Nouveau contexte créé pour: ${contextKey} (userId: ${userId}, sessionId: ${sessionId})`);
    this.contexts.set(contextKey, {
      sessionId: contextKey,
      detectedLang: 'fr',
      lastIntent: 'idle',
      lastEntities: {},
      step: 'idle',
      tempData: {},
      messageHistory: [],
      timestamp: new Date()
    });
  } else {
    const existingContext = this.contexts.get(contextKey)!;
    console.log(`📦 Contexte existant pour: ${contextKey} - step: ${existingContext.step}`);
  }
  return this.contexts.get(contextKey)!;
}
  
  private resetContextStep(userId: string) {
    for (const [sessionId, context] of this.contexts.entries()) {
      if (context.userId === userId) {
        context.step = 'idle';
        context.tempData = {};
        break;
      }
    }
  }
  
  private getDefaultResponse(lang: Language): ChatbotResponseDto {
    const replies = {
      fr: "🤔 Je n'ai pas bien compris.\n\nEssayez :\n• 🔍 'Cherche restaurant'\n• 📅 'Réserver'\n• ❌ 'Annuler'\n• 📍 'Services près de moi'\n• ⭐ 'Meilleurs services'\n• 🎯 'Recommandations'",
      en: "🤔 I didn't understand.\n\nTry:\n• 🔍 'Find restaurant'\n• 📅 'Book'\n• ❌ 'Cancel'\n• 📍 'Near me'\n• ⭐ 'Top rated'\n• 🎯 'Recommendations'",
      tn: "🤔 Ma fhemtekch.\n\nJreb:\n• 🔍 'Chouf restaurant'\n• 📅 '7ejjez'\n• ❌ 'Batel'\n• 📍 'Qrib meni'\n• ⭐ 'Ahsen'\n• 🎯 'Recommandations'",
      ar: "🤔 لم أفهم.\n\nجرب:\n• 🔍 'ابحث عن مطعم'\n• 📅 'احجز'\n• ❌ 'الغ'\n• 📍 'بالقرب مني'\n• ⭐ 'أفضل الخدمات'\n• 🎯 'توصيات'"
    };
    return { reply: replies[lang] || replies.fr, intent: 'unknown', entities: {} };
  }
}