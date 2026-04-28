// src/modules/ai/services/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../../database/schemas/reservation.schema';
import { ChatbotRequestDto, ChatbotResponseDto } from '../dto/ai.dto';
import { NlpService } from './nlp.service';
import { RecommendationService } from './recommendation.service';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

// ─────────────────────────────────────────────────────────────
//  NORMALISATION (identique à nlp.service pour cohérence)
// ─────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyIncludes(text: string, keyword: string): boolean {
  const words = text.split(/\s+/);
  const maxDist = keyword.length <= 4 ? 1 : 2;
  return words.some(w => levenshtein(w, normalize(keyword)) <= maxDist);
}

// ─────────────────────────────────────────────────────────────
//  MOTS-CLÉS D'INTENTION (version allégée pour le router)
//  La version complète est dans NlpService — ici on garde
//  juste ce dont ai.service a besoin pour son fallback
// ─────────────────────────────────────────────────────────────

const SEARCH_KW = [
  'cherche','recherche','trouve','trouver','ou','proche','pres','available',
  'find','search','near','show','list','where','give me',
  'fama','fayn','win','wen','nchof','nchouf','najjem','qrib','grib','hawali',
  'ابحث','فين','وين','نشوف','قريب',
];

const BOOKING_KW = [
  'reserver','reservation','reserv','resrevation','book','rdv','rendezvous',
  'commander','veux','voudrais','aimerai','besoin','table','chambre','want',
  'hejez','hejiz','nhejez','nheb','nhabb','mawid','mawad','tabla',
  'احجز','حجز','موعد','نحب','طاولة',
];

const CANCEL_KW = [
  'annuler','annule','annulation','supprimer','cancel','delete','remove',
  'batel','btal','ma njiich','ma jich','mish ji','waqef',
  'الغ','إلغاء','بطل','ما نجيش',
];

const HELP_KW = [
  'aide','comment','quoi','expliquer','info','guide','help','how','what',
  '3aweni','chno','chnowa','kifech','kifash','kifesh','kefash','wesh',
  'ساعدني','كيفاش','شنوا','كيف',
];

function matchesKeywords(text: string, keywords: string[]): boolean {
  const norm = normalize(text);
  return keywords.some(kw => {
    const nk = normalize(kw);
    return norm.includes(nk) || fuzzyIncludes(norm, nk);
  });
}

// ─────────────────────────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
//  AI SERVICE
// ─────────────────────────────────────────────────────────────

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

  // ── POINT D'ENTRÉE PRINCIPAL ───────────────────────────────

  async chatbot(request: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    try {
      // Rate limiting
      if (request.userId && !this.checkRateLimit(request.userId)) {
        return {
          reply: '⏳ Vous avez envoyé trop de messages. Attendez quelques secondes. / Stenna chwaya !',
          intent: 'rate_limited',
          entities: {},
        };
      }

      const sessionId = request.sessionId || this.generateSessionId();
      const context = this.getContext(sessionId);
      context.userId = request.userId;

      // Analyse NLP (gère toutes les langues et variantes)
      const intentAnalysis = await this.nlpService.analyzeIntent(request.query);
      const entities = intentAnalysis.entities;

      // Router : NLP d'abord, fallback keyword ensuite
      let response: ChatbotResponseDto;
      const intent = intentAnalysis.intent !== 'unknown'
        ? intentAnalysis.intent
        : this.fallbackIntentDetection(request.query);

      switch (intent) {
        case 'search':
          response = await this.handleSearchIntent(request.query, request.location, entities);
          break;
        case 'booking':
          response = await this.handleBookingIntent(request.query, request.userId, context);
          break;
        case 'cancel':
          response = await this.handleCancelIntent(request.userId, context);
          break;
        case 'help':
          response = await this.handleHelpIntent();
          break;
        case 'greeting':
          response = await this.handleGreetingIntent();
          break;
        case 'goodbye':
          response = this.handleGoodbyeIntent();
          break;
        case 'feedback':
          response = this.handleFeedbackIntent();
          break;
        default:
          response = await this.handleUnknownIntent(request.query);
      }

      // Mise à jour du contexte
      context.lastIntent = response.intent;
      context.lastEntities = entities;
      context.messageHistory.push(
        { role: 'user', content: request.query, timestamp: new Date() },
        { role: 'assistant', content: response.reply, timestamp: new Date() },
      );
      context.timestamp = new Date();
      this.contexts.set(sessionId, context);
      this.cleanupOldContexts();

      return response;
    } catch (error) {
      this.logger.error(`Chatbot error: ${getErrorMessage(error)}`);
      return {
        reply: "😔 Désolé, une erreur s'est produite. Réessayez ! / Désolé, hawi merra okhra.",
        intent: 'error',
        entities: {},
      };
    }
  }

  // ── DÉTECTION DE SECOURS (keywords simples) ────────────────

  private fallbackIntentDetection(query: string): string {
    if (matchesKeywords(query, SEARCH_KW))  return 'search';
    if (matchesKeywords(query, BOOKING_KW)) return 'booking';
    if (matchesKeywords(query, CANCEL_KW))  return 'cancel';
    if (matchesKeywords(query, HELP_KW))    return 'help';
    return 'unknown';
  }

  // ── HANDLERS ──────────────────────────────────────────────

  private async handleSearchIntent(
    query: string,
    location?: { lat: number; lng: number },
    entities?: any,
  ): Promise<ChatbotResponseDto> {
    try {
      const searchQuery: any = { isActive: true };
      if (entities?.category) searchQuery.category = entities.category;
      if (entities?.price)    searchQuery.basePrice = { $lte: entities.price };

      let services: any[] = [];

      // Géoloc si disponible (ou si l'utilisateur demande "près de moi")
      const useGeo = location?.lat && location?.lng;

      if (useGeo) {
        const radius = entities?.radius || 10;
        services = await this.serviceModel
          .find({
            ...searchQuery,
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
                $maxDistance: radius * 1000,
              },
            },
          })
          .limit(5)
          .exec();
      }

      // Si pas de géoloc ou pas de résultat → recherche classique
      if (!useGeo || services.length === 0) {
        // Filtre par ville si extraite
        if (entities?.locationName) {
          searchQuery['location.city'] = {
            $regex: entities.locationName,
            $options: 'i',
          };
        }
        services = await this.serviceModel.find(searchQuery).limit(5).exec();
      }

      if (services.length === 0) {
        return {
          reply: "😕 Aucun service trouvé pour votre recherche.\n" +
                 "Essayez d'autres mots-clés ou une autre ville.\n" +
                 "Ma lqitlekch — jreb krara okhra !",
          intent: 'search',
          entities: entities || {},
        };
      }

      return {
        reply: this.formatSearchResults(services),
        intent: 'search',
        entities: entities || {},
        data: { services },
      };
    } catch (error) {
      this.logger.error(`Search error: ${getErrorMessage(error)}`);
      return { reply: "Erreur lors de la recherche. Réessayez.", intent: 'error', entities: {} };
    }
  }

  private async handleBookingIntent(
    query: string,
    userId?: string,
    context?: ConversationContext,
  ): Promise<ChatbotResponseDto> {
    if (!userId) {
      return {
        reply: "🔐 Connectez-vous pour faire une réservation.\n" +
               "Please log in to book. / Lazem trodd dakhouli!",
        intent: 'booking',
        entities: {},
      };
    }

    if (context?.step === 'booking' && context?.tempData) {
      return this.confirmBooking(context.tempData, userId);
    }

    return {
      reply: "📅 Je vais vous aider à réserver !\n\n" +
             "Quel type de service cherchez-vous ?\n" +
             "(restaurant, hôtel, spa, salon, salle de sport...)",
      intent: 'booking',
      entities: {},
    };
  }

  private async handleCancelIntent(
    userId?: string,
    context?: ConversationContext,
  ): Promise<ChatbotResponseDto> {
    if (!userId) {
      return {
        reply: "🔐 Connectez-vous pour annuler une réservation.",
        intent: 'cancel',
        entities: {},
      };
    }

    const reservations = await this.reservationModel
      .find({ clientId: new Types.ObjectId(userId), status: { $in: ['pending', 'confirmed'] } })
      .populate('serviceId', 'name')
      .limit(5)
      .exec();

    if (reservations.length === 0) {
      return {
        reply: "✅ Vous n'avez aucune réservation active à annuler.\n" +
               "Ma3ndekch hejz mawjoud.",
        intent: 'cancel',
        entities: {},
      };
    }

    const list = reservations
      .map((r, i) => `${i + 1}. ${(r.serviceId as any).name} — ${new Date(r.startTime).toLocaleString('fr-FR')}`)
      .join('\n');

    if (context) {
      context.tempData = { reservations };
      context.step = 'cancelling';
    }

    return {
      reply: `❌ Vos réservations actives :\n\n${list}\n\nDites-moi le numéro à annuler.`,
      intent: 'cancel',
      entities: { reservations },
    };
  }

  private async handleHelpIntent(): Promise<ChatbotResponseDto> {
    return {
      reply:
        '🤖 **Je comprends le français, l\'anglais et la darija (عربي + latin)**\n\n' +
        '**Exemples de ce que vous pouvez dire :**\n\n' +
        '🔍 **Chercher** :\n' +
        '  • "Je cherche un restaurant à Sousse"\n' +
        '  • "find a spa near me"\n' +
        '  • "nchof restaurant qrib meni"\n' +
        '  • "فما مطعم في سوسة؟"\n\n' +
        '📅 **Réserver** :\n' +
        '  • "Je veux réserver une table"\n' +
        '  • "book a hotel in Tunis"\n' +
        '  • "nhejez restaurant"\n' +
        '  • "نحجز فندق"\n\n' +
        '❌ **Annuler** :\n' +
        '  • "annuler ma réservation"\n' +
        '  • "batel el hejz mte3i"\n\n' +
        '⭐ **Avis** : "donner mon avis sur le service"\n\n' +
        '💡 Pas besoin d\'écrire parfaitement — je comprends quand même !',
      intent: 'help',
      entities: {},
    };
  }

  private async handleGreetingIntent(): Promise<ChatbotResponseDto> {
    const greetings = [
      '👋 Bonjour ! Comment puis-je vous aider ?\n_(Ahla ! Kifeh nel3awnek ?)_',
      '👋 Hello! How can I help you today?\n_(Bonjour ! Je suis là pour vous aider.)_',
      '👋 أهلاً وسهلاً! كيفاش نعاونك اليوم؟\n_(Bonjour ! Je parle aussi français et anglais.)_',
      '👋 Ahla ! Ana mawjoud ta3awnek.\nBienvenue ! Je suis votre assistant.',
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      intent: 'greeting',
      entities: {},
    };
  }

  private handleGoodbyeIntent(): ChatbotResponseDto {
    const msgs = [
      '👋 Au revoir ! Bonne journée !',
      '👋 Beslema! Yalla bkhir 🌟',
      '👋 مع السلامة! نتمنالك يوم سعيد',
    ];
    return {
      reply: msgs[Math.floor(Math.random() * msgs.length)],
      intent: 'goodbye',
      entities: {},
    };
  }

  private handleFeedbackIntent(): ChatbotResponseDto {
    return {
      reply: '⭐ Merci de vouloir partager votre avis !\n' +
             'Pour quel service voulez-vous laisser un commentaire ?',
      intent: 'feedback',
      entities: {},
    };
  }

  private async handleUnknownIntent(query: string): Promise<ChatbotResponseDto> {
    return {
      reply:
        "🤔 Je n'ai pas bien compris votre demande.\n\n" +
        "Ma fhemtekch mezian — essayez de dire :\n\n" +
        "🔍 **Chercher** un service\n" +
        "📅 **Réserver** un rendez-vous\n" +
        "❌ **Annuler** une réservation\n" +
        "❓ **Aide** pour plus d'infos\n\n" +
        "_Tapez **aide** / **help** / **kifech** pour voir les exemples._",
      intent: 'unknown',
      entities: {},
    };
  }

  private async confirmBooking(tempData: any, userId: string): Promise<ChatbotResponseDto> {
    return {
      reply: '✅ Réservation confirmée ! Un email de confirmation vous a été envoyé.\n' +
             'Hejzek mzabt ! Email mcha 3andek.',
      intent: 'booking_complete',
      entities: {},
    };
  }

  // ── FORMATAGE DES RÉSULTATS ────────────────────────────────

  private formatSearchResults(services: ServiceDocument[]): string {
    let reply = `🎯 **${services.length} résultat(s) trouvé(s) :**\n\n`;

    services.forEach((s: any, i) => {
      reply += `**${i + 1}. ${s.name}**\n`;
      if (s.location?.address) reply += `   📍 ${s.location.address}\n`;
      if (s.location?.city)    reply += `   🏙️ ${s.location.city}\n`;
      reply += `   ⭐ ${s.avgRating || 0}/5 (${s.reviewCount || 0} avis)\n`;
      reply += `   💰 ${s.basePrice} DT\n`;
      if (s.duration)          reply += `   🕐 ${s.duration} min\n`;
      reply += '\n';
    });

    reply += '💬 Voulez-vous réserver l\'un de ces services ?';
    return reply;
  }

  // ── UTILITAIRES ───────────────────────────────────────────

  async getRecommendations(userId: string, limit = 10): Promise<any[]> {
    return this.recommendationService.getPersonalizedRecommendations(userId, limit);
  }

  async handleStreamingResponse(request: ChatbotRequestDto): Promise<any> {
    return this.chatbot(request);
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

  private checkRateLimit(userId: string, limit = 15, windowMs = 60000): boolean {
    const now = Date.now();
    const reqs = (this.rateLimits.get(userId) || []).filter(t => now - t < windowMs);
    if (reqs.length >= limit) return false;
    reqs.push(now);
    this.rateLimits.set(userId, reqs);
    return true;
  }

  private cleanupOldContexts(): void {
    const maxAge = 30 * 60 * 1000;
    const now = Date.now();
    for (const [id, ctx] of this.contexts.entries()) {
      if (now - ctx.timestamp.getTime() > maxAge) this.contexts.delete(id);
    }
  }
}